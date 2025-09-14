"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa, { ParseResult } from "papaparse";
import { BuyerInput } from "@/validators/buyer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExportPage() {
  const [buyers, setBuyers] = useState<BuyerInput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyers = async () => {
      const { data, error } = await supabase.from("buyers").select("*");
      if (error) {
        console.error(error);
      } else {
        setBuyers(data as BuyerInput[]);
      }
      setLoading(false);
    };
    fetchBuyers();
  }, []);

  const handleExport = () => {
    const csv = Papa.unparse(buyers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buyers_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6 text-center text-gray-600 animate-pulse">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center sm:text-left">
          Export Buyers to CSV
        </h1>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Export buyers to CSV"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleExport()}
          >
            Export CSV
          </button>
          {buyers.length > 0 && (
            <p className="mt-4 text-gray-600 text-center sm:text-left">
              {buyers.length} buyer(s) available for export.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}