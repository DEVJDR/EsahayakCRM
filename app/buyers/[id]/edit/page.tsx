"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buyerCreateSchema, BuyerInput } from "@/validators/buyer";
import { useAuth } from "@/components/AuthProvider";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import {
  cities,
  propertyTypes,
  bhkOptions,
  purposeOptions,
  timelineOptions,
  sourceOptions,
  statusOptions,
} from "@/validators/buyer";
import ErrorBoundary from "@/components/ErrorBoundary";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditBuyerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [form, setForm] = useState<BuyerInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    const fetchBuyer = async () => {
      setLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setFetchError("Failed to load buyer");
        setLoading(false);
        return;
      }

      const currentUserId = user?.id || "demo-user-id";
      if (data.owner_id && data.owner_id !== currentUserId) {
        setFetchError("You do not have permission to edit this lead");
        setLoading(false);
        return;
      }

      setForm({
        full_name: data.full_name,
        email: data.email || "",
        phone: data.phone,
        city: data.city,
        propertyType: data.property_type,
        bhk: data.bhk || undefined,
        purpose: data.purpose,
        budgetMin: data.budget_min ?? undefined,
        budgetMax: data.budget_max ?? undefined,
        timeline: data.timeline,
        source: data.source,
        notes: data.notes || "",
        tags: data.tags || [],
        status: data.status,
      });
      setUpdatedAt(data.updated_at);
      setLoading(false);
    };
    fetchBuyer();
  }, [id, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev!,
      [name]:
        ["budgetMin", "budgetMax"].includes(name)
          ? value === ""
            ? undefined
            : parseInt(value)
          : value,
    }));
    if (name === "propertyType" && !["Apartment", "Villa"].includes(value)) {
      setForm((prev) => ({ ...prev!, bhk: undefined }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    setForm((prev) => ({ ...prev!, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !user) return;

    const result = buyerCreateSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const { data: current, error: fetchErr } = await supabase
      .from("buyers")
      .select("updated_at")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      setFetchError("Failed to fetch latest record for concurrency check");
      return;
    }

    if (current.updated_at !== updatedAt) {
      setFetchError("This record has been changed by someone else. Please refresh.");
      return;
    }

    const updateData = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      property_type: form.propertyType,
      bhk: form.bhk,
      purpose: form.purpose,
      budget_min: form.budgetMin,
      budget_max: form.budgetMax,
      timeline: form.timeline,
      source: form.source,
      notes: form.notes,
      tags: form.tags,
      status: form.status,
      updated_at: new Date().toISOString(),
      owner_id: user.id || "demo-user-id",
    };

    const { error } = await supabase
      .from("buyers")
      .update(updateData)
      .eq("id", id);

    if (error) {
      setFetchError("Failed to update lead: " + error.message);
    } else {
      await supabase.from("buyer_history").insert({
        buyer_id: id,
        changed_by: user.id || "demo-user-id",
        changed_at: new Date().toISOString(),
        diff: JSON.stringify({ updated: form }),
      });
      setUpdatedAt(new Date().toISOString());
      alert("Lead updated successfully!");
      router.push("/buyers");
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600 animate-pulse">Loading...</div>;
  if (fetchError) return <div className="p-6 text-center text-red-600">{fetchError}</div>;
  if (!form) return <div className="p-6 text-center text-red-600">Buyer not found</div>;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center sm:text-left">
            Edit Buyer Lead
          </h1>
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-lg space-y-6" aria-label="Edit buyer form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <InputField
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  placeholder="Enter full name"
                  aria-required="true"
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? `error-${form.full_name}` : undefined}
                />
                {errors.full_name && <p className="text-red-600 mt-1 text-sm" id={`error-${form.full_name}`}>{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <InputField
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `error-${form.email}` : undefined}
                />
                {errors.email && <p className="text-red-600 mt-1 text-sm" id={`error-${form.email}`}>{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <InputField
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Enter phone number"
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? `error-${form.phone}` : undefined}
                />
                {errors.phone && <p className="text-red-600 mt-1 text-sm" id={`error-${form.phone}`}>{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <SelectField
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  error={errors.city}
                  aria-required="true"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? `error-${form.city}` : undefined}
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </SelectField>
                {errors.city && <p className="text-red-600 mt-1 text-sm" id={`error-${form.city}`}>{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <SelectField
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  error={errors.propertyType}
                  aria-required="true"
                  aria-invalid={!!errors.propertyType}
                  aria-describedby={errors.propertyType ? `error-${form.propertyType}` : undefined}
                >
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </SelectField>
                {errors.propertyType && <p className="text-red-600 mt-1 text-sm" id={`error-${form.propertyType}`}>{errors.propertyType}</p>}
              </div>
              {["Apartment", "Villa"].includes(form.propertyType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                  <SelectField
                    name="bhk"
                    value={form.bhk || ""}
                    onChange={handleChange}
                    error={errors.bhk}
                    aria-invalid={!!errors.bhk}
                    aria-describedby={errors.bhk ? `error-${form.bhk}` : undefined}
                  >
                    {bhkOptions.map((bhk) => (
                      <option key={bhk} value={bhk}>{bhk}</option>
                    ))}
                  </SelectField>
                  {errors.bhk && <p className="text-red-600 mt-1 text-sm" id={`error-${form.bhk}`}>{errors.bhk}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <SelectField
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  error={errors.purpose}
                  aria-required="true"
                  aria-invalid={!!errors.purpose}
                  aria-describedby={errors.purpose ? `error-${form.purpose}` : undefined}
                >
                  {purposeOptions.map((purpose) => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </SelectField>
                {errors.purpose && <p className="text-red-600 mt-1 text-sm" id={`error-${form.purpose}`}>{errors.purpose}</p>}
              </div>
              <div className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min</label>
                    <InputField
                      type="number"
                      name="budgetMin"
                      value={form.budgetMin || ""}
                      onChange={handleChange}
                      error={errors.budgetMin}
                      placeholder="Minimum budget"
                      aria-invalid={!!errors.budgetMin}
                      aria-describedby={errors.budgetMin ? `error-${form.budgetMin}` : undefined}
                    />
                    {errors.budgetMin && <p className="text-red-600 mt-1 text-sm" id={`error-${form.budgetMin}`}>{errors.budgetMin}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max</label>
                    <InputField
                      type="number"
                      name="budgetMax"
                      value={form.budgetMax || ""}
                      onChange={handleChange}
                      error={errors.budgetMax}
                      placeholder="Maximum budget"
                      aria-invalid={!!errors.budgetMax}
                      aria-describedby={errors.budgetMax ? `error-${form.budgetMax}` : undefined}
                    />
                    {errors.budgetMax && <p className="text-red-600 mt-1 text-sm" id={`error-${form.budgetMax}`}>{errors.budgetMax}</p>}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <SelectField
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  error={errors.timeline}
                  aria-required="true"
                  aria-invalid={!!errors.timeline}
                  aria-describedby={errors.timeline ? `error-${form.timeline}` : undefined}
                >
                  {timelineOptions.map((timeline) => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </SelectField>
                {errors.timeline && <p className="text-red-600 mt-1 text-sm" id={`error-${form.timeline}`}>{errors.timeline}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <SelectField
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  error={errors.source}
                  aria-required="true"
                  aria-invalid={!!errors.source}
                  aria-describedby={errors.source ? `error-${form.source}` : undefined}
                >
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </SelectField>
                {errors.source && <p className="text-red-600 mt-1 text-sm" id={`error-${form.source}`}>{errors.source}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 h-24 resize-y transition-all duration-200"
                  aria-label="Notes"
                  aria-invalid={!!errors.notes}
                  aria-describedby={errors.notes ? `error-${form.notes}` : undefined}
                />
                {errors.notes && <p className="text-red-600 mt-1 text-sm" id={`error-${form.notes}`}>{errors.notes}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <SelectField
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  error={errors.status}
                  aria-required="true"
                  aria-invalid={!!errors.status}
                  aria-describedby={errors.status ? `error-${form.status}` : undefined}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </SelectField>
                {errors.status && <p className="text-red-600 mt-1 text-sm" id={`error-${form.status}`}>{errors.status}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags.join(", ") || ""}
                  onChange={handleTagsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  aria-label="Tags"
                  aria-invalid={!!errors.tags}
                  aria-describedby={errors.tags ? `error-${form.tags}` : undefined}
                />
                {errors.tags && <p className="text-red-600 mt-1 text-sm" id={`error-${form.tags}`}>{errors.tags}</p>}
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Save changes"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </ErrorBoundary>
  );
}