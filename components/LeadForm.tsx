"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { buyerCreateSchema, BuyerInput } from "@/validators/buyer";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  cities,
  propertyTypes,
  bhkOptions,
  purposeOptions,
  timelineOptions,
  sourceOptions,
} from "@/validators/buyer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LeadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<BuyerInput>({
    full_name: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "2",
    purpose: "Buy",
    budgetMin: undefined,
    budgetMax: undefined,
    timeline: "0-3m",
    source: "Website",
    notes: "",
    tags: [],
    status: "New",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };
    getSession();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["budgetMin", "budgetMax"].includes(name)
          ? value === ""
            ? undefined
            : parseInt(value)
          : value,
    }));
    if (name === "propertyType" && !["Apartment", "Villa"].includes(value)) {
      setForm((prev) => ({ ...prev, bhk: undefined }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    setForm((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (!session?.user) {
      alert("Please log in to save a buyer.");
      return;
    }

    const buyerData = {
      ...result.data,
      owner_id: session.user.id,
    };

    const { error, data } = await supabase
      .from("buyers")
      .insert([buyerData])
      .select("id")
      .single();

    if (error) {
      alert("Error saving buyer: " + error.message);
    } else {
      await supabase.from("buyer_history").insert({
        buyer_id: data.id,
        changed_by: session.user.id,
        diff: JSON.stringify(buyerData),
      });
      alert("Buyer saved successfully!");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        city: "Chandigarh",
        propertyType: "Apartment",
        bhk: "2",
        purpose: "Buy",
        budgetMin: undefined,
        budgetMax: undefined,
        timeline: "0-3m",
        source: "Website",
        notes: "",
        tags: [],
        status: "New",
      });
      if (onSuccess) onSuccess();
      router.push("/buyers");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Buyer Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="New buyer form">
          <InputField
            label="Full Name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
            placeholder="Enter full name"
            aria-required="true"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? `error-${form.full_name}` : undefined}
          />
          <InputField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `error-${form.email}` : undefined}
          />
          <InputField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter phone number"
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `error-${form.phone}` : undefined}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="City"
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
            <SelectField
              label="Property Type"
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
          </div>
          {["Apartment", "Villa"].includes(form.propertyType) && (
            <SelectField
              label="BHK"
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
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Purpose"
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
            <SelectField
              label="Timeline"
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Budget Min"
              name="budgetMin"
              value={form.budgetMin || ""}
              onChange={handleChange}
              error={errors.budgetMin}
              placeholder="Minimum budget"
              type="number"
              aria-invalid={!!errors.budgetMin}
              aria-describedby={errors.budgetMin ? `error-${form.budgetMin}` : undefined}
            />
            <InputField
              label="Budget Max"
              name="budgetMax"
              value={form.budgetMax || ""}
              onChange={handleChange}
              error={errors.budgetMax}
              placeholder="Maximum budget"
              type="number"
              aria-invalid={!!errors.budgetMax}
              aria-describedby={errors.budgetMax ? `error-${form.budgetMax}` : undefined}
            />
          </div>
          <SelectField
            label="Source"
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
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional details..."
              className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-y min-h-[120px]"
              aria-label="Notes"
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? `error-${form.notes}` : undefined}
            />
            {errors.notes && <p className="text-red-600 mt-1 text-sm" id={`error-${form.notes}`}>{errors.notes}</p>}
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={form.tags.join(", ") || ""}
              onChange={handleTagsChange}
              placeholder="e.g., urgent, first-time-buyer"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              aria-label="Tags"
              aria-invalid={!!errors.tags}
              aria-describedby={errors.tags ? `error-${form.tags}` : undefined}
            />
            {errors.tags && <p className="text-red-600 mt-1 text-sm" id={`error-${form.tags}`}>{errors.tags}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Save buyer"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
          >
            Save Buyer
          </button>
        </form>
      </div>
    </ErrorBoundary>
  );
}