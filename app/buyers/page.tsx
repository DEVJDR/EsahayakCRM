"use client";

import { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const supabase: SupabaseClient<any, "public"> = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Buyer {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

// Export fetchBuyers as a separate utility function
export async function fetchBuyers(
  setters: { setBuyers: (buyers: Buyer[]) => void; setLoading: (loading: boolean) => void; setFetchError: (error: string | null) => void; setTotalCount: (count: number) => void },
  searchParams: URLSearchParams,
  page: number
) {
  const { setBuyers, setLoading, setFetchError, setTotalCount } = setters;

  setLoading(true);
  setFetchError(null);

  let query = supabase
    .from("buyers")
    .select(
      "id, full_name, email, phone, city, property_type, bhk, budget_min, budget_max, timeline, status, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const timeline = searchParams.get("timeline") || "";
  const search = searchParams.get("search") || "";

  if (city) query = query.eq("city", city);
  if (propertyType) query = query.eq("property_type", propertyType);
  if (status) query = query.eq("status", status);
  if (timeline) query = query.eq("timeline", timeline);
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  try {
    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const mappedBuyers: Buyer[] = (data || []).map((item) => ({
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      city: item.city,
      propertyType: item.property_type,
      bhk: item.bhk,
      budgetMin: item.budget_min,
      budgetMax: item.budget_max,
      timeline: item.timeline,
      status: item.status,
      updatedAt: item.updated_at,
    }));
    setBuyers(mappedBuyers);
    setTotalCount(count || 0);
  } catch (err) {
    setFetchError(`Failed to fetch buyers: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

export default function BuyersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { session, user } = useAuth();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const timeline = searchParams.get("timeline") || "";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    fetchBuyers({ setBuyers, setLoading, setFetchError, setTotalCount }, searchParams, page);
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const handleLogout = () => router.push("/login");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Buyer Leads
            </h1>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-md shadow-lg hover:bg-red-700 transition-all duration-200 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && handleLogout()}
            >
              Logout
            </button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-4">
            <Link
              href="/buyers/new"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Create new buyer"
              tabIndex={0}
            >
              New Buyer
            </Link>
            <Link
              href="/buyers/import"
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Import buyers"
              tabIndex={0}
            >
              Import Buyers
            </Link>
            <Link
              href="/buyers/export"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export buyers"
              tabIndex={0}
            >
              Export Buyers
            </Link>
          </div>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "City", key: "city", options: ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"] },
              { label: "Property Type", key: "propertyType", options: ["Apartment", "Villa", "Plot", "Office", "Retail"] },
              { label: "Status", key: "status", options: ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"] },
              { label: "Timeline", key: "timeline", options: ["0-3m", "3-6m", ">6m", "Exploring"] },
            ].map((f) => (
              <select
                key={f.key}
                value={searchParams.get(f.key) || ""}
                onChange={(e) => handleFilterChange(f.key, e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200"
                aria-label={`${f.label} filter`}
                aria-required="true"
              >
                <option value="">{`All ${f.label}s`}</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt} className="bg-white">
                    {opt}
                  </option>
                ))}
              </select>
            ))}
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set("search", e.target.value);
                params.set("page", "1");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200"
              aria-label="Search buyers"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && router.push(`${pathname}?${new URLSearchParams(searchParams).set("search", search).toString()}`)}
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="w-full border-collapse table-auto text-sm sm:text-base">
              <thead className="bg-gray-100">
                <tr>
                  {["Name", "Phone", "Email", "City", "Property Type", "Budget", "Timeline", "Status", "Updated At", "Action"].map((h) => (
                    <th
                      key={h}
                      className="p-2 sm:p-3 border-b border-gray-200 text-left text-gray-700 font-semibold uppercase tracking-wider"
                      scope="col"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center p-4 text-gray-500 animate-pulse">
                      Loading...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={10} className="text-center p-4 text-red-600">
                      {fetchError}
                    </td>
                  </tr>
                ) : buyers.length > 0 ? (
                  buyers.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
                    >
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.fullName}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.phone}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.email || "-"}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.city}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.propertyType}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">
                        ₹{b.budgetMin || 0} - ₹{b.budgetMax || 0}
                      </td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.timeline}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">{b.status}</td>
                      <td className="p-2 sm:p-3 border-r border-gray-200 text-gray-800">
                        {new Date(b.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-2 sm:p-3">
                        <Link
                          href={`/buyers/${b.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Edit buyer ${b.fullName}`}
                          tabIndex={0}
                          onKeyPress={(e) => e.key === "Enter" && router.push(`/buyers/${b.id}/edit`)}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center p-4 text-gray-500">
                      No buyers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", (page - 1).toString());
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-all duration-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                aria-label="Previous page"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && router.push(`${pathname}?${new URLSearchParams(searchParams).set("page", (page - 1).toString()).toString()}`)}
              >
                Prev
              </button>
              <span className="px-4 py-2 text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", (page + 1).toString());
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-all duration-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                aria-label="Next page"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && router.push(`${pathname}?${new URLSearchParams(searchParams).set("page", (page + 1).toString()).toString()}`)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}