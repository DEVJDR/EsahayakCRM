"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Papa, { ParseResult } from "papaparse";
import { buyerCreateSchema, BuyerInput } from "@/validators/buyer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessCount(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrors(["Please select a CSV file."]);
      return;
    }

    setUploading(true);
    setErrors([]);
    setSuccessCount(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<any>) => {
        const rows = results.data as any[];
        if (rows.length > 200) {
          setErrors(["Max 200 rows allowed."]);
          setUploading(false);
          return;
        }

        const validRows: BuyerInput[] = [];
        const rowErrors: string[] = [];

        rows.forEach((row, idx) => {
          // Parse numeric fields
          if (row.budgetMin) row.budgetMin = parseInt(row.budgetMin);
          if (row.budgetMax) row.budgetMax = parseInt(row.budgetMax);

          // Parse tags into array, handling empty or single values
          row.tags = row.tags
            ? row.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0)
            : [];

          // Handle bhk conditionally based on propertyType
          if (["Apartment", "Villa"].includes(row.property_type) && !row.bhk) {
            rowErrors.push(`Row ${idx + 2}: BHK is required for Apartment or Villa property type`);
          } else if (!["Apartment", "Villa"].includes(row.property_type)) {
            row.bhk = undefined; // Clear bhk for non-relevant property types
          }

          const result = buyerCreateSchema.safeParse(row);
          if (result.success) {
            validRows.push(result.data);
          } else {
            rowErrors.push(`Row ${idx + 2}: ${result.error.errors.map((e) => e.message).join(", ")}`);
          }
        });

        setErrors([...rowErrors, ...errors]); // Combine existing and new errors

        if (validRows.length > 0) {
          const { error } = await supabase.from("buyers").insert(validRows);
          if (error) {
            setErrors([`Error inserting rows: ${error.message}`, ...rowErrors]);
          } else {
            setSuccessCount(validRows.length);
            alert(`Successfully inserted ${validRows.length} rows!`);
          }
        } else {
          setErrors(rowErrors.length > 0 ? rowErrors : ["No valid rows to import."]);
        }
        setUploading(false);
      },
      error: (err: Error) => {
        setErrors(["CSV parse error: " + err.message]);
        setUploading(false);
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center sm:text-left">
          Import Buyers from CSV
        </h1>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              aria-label="Select CSV file"
              disabled={uploading}
            />
            <button
              onClick={handleUpload}
              className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Upload CSV"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && handleUpload()}
              disabled={uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {successCount > 0 && (
            <p className="text-green-700 text-center sm:text-left">
              {successCount} row(s) imported successfully!
            </p>
          )}
          {errors.length > 0 && (
            <div className="bg-red-100 p-4 rounded-lg">
              <h2 className="font-semibold text-red-700 mb-2">Errors:</h2>
              <ul className="list-disc pl-5 text-red-700 text-sm">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}