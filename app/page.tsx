"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const [totalCount, setTotalCount] = useState(0);

  const PAGE_SIZE = 10;

  // Fetch buyers from Supabase with filters and pagination
  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const city = searchParams.get("city") || "";
      const propertyType = searchParams.get("propertyType") || "";
      const status = searchParams.get("status") || "";
      const timeline = searchParams.get("timeline") || "";

      let query = supabase
        .from("buyers")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (city) query = query.eq("city", city);
      if (propertyType) query = query.eq("property_type", propertyType);
      if (status) query = query.eq("status", status);
      if (timeline) query = query.eq("timeline", timeline);
      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch buyers");
      }
      setBuyers(data);
      setTotalCount(count || 0);
      setLoading(false);
    } catch (err) {
      setError("Error fetching buyers");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [searchParams]);

  const handleLogout = () => {
    router.push("/login");
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`/buyers?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <main className="p-6 md:p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Mini Buyer Lead Intake
        </h1>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500 text-white rounded-3xl shadow-md hover:bg-red-600 transition text-lg"
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap gap-4 justify-center">
        {[
          { label: "City", key: "city", options: ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"] },
          { label: "Property Type", key: "propertyType", options: ["Apartment", "Villa", "Plot", "Office", "Retail"] },
          { label: "Status", key: "status", options: ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"] },
          { label: "Timeline", key: "timeline", options: ["0-3m", "3-6m", ">6m", "Exploring"] },
        ].map((filter) => (
          <select
            key={filter.key}
            value={searchParams.get(filter.key) || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-gray-900"
          >
            <option value="">All {filter.label}s</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set("search", e.target.value);
            params.set("page", "1");
            router.push(`/buyers?${params.toString()}`);
            setSearch(e.target.value);
          }}
          className="w-full md:w-auto p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 placeholder-gray-400 transition flex-grow min-w-[200px]"
        />
      </div>

      {/* Buyers Table */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900 text-center">
          Recent Buyers
        </h2>
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600 text-lg">{error}</p>
        ) : buyers.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No buyers found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto min-w-[800px]">
                <thead className="bg-gray-100">
                  <tr>
                    {["Name", "Phone", "City", "Property Type", "Budget", "Timeline", "Status", "Updated At", "Action"].map((header) => (
                      <th key={header} className="p-3 border text-left text-gray-900 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 border text-gray-900">{buyer.full_name}</td>
                      <td className="p-3 border text-gray-900">{buyer.phone}</td>
                      <td className="p-3 border text-gray-900">{buyer.city}</td>
                      <td className="p-3 border text-gray-900">{buyer.property_type}</td>
                      <td className="p-3 border text-gray-900">
                        ₹{buyer.budget_min || "N/A"} - ₹{buyer.budget_max || "N/A"}
                      </td>
                      <td className="p-3 border text-gray-900">{buyer.timeline}</td>
                      <td className="p-3 border text-gray-900">{buyer.status}</td>
                      <td className="p-3 border text-gray-900">
                        {new Date(buyer.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 border">
                        <Link href={`/buyers/${buyer.id}/edit`} className="text-blue-600 hover:underline">
                          View / Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-3 flex-wrap">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", (page - 1).toString());
                    router.push(`/buyers?${params.toString()}`);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition text-gray-900"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", (page + 1).toString());
                    router.push(`/buyers?${params.toString()}`);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition text-gray-900"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}