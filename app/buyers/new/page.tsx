"use client";

import LeadForm from "@/components/LeadForm";

export default function NewBuyerPage() {
  return (
    <main className="p-6 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-12 text-gray-900 text-center">
          Add New Buyer Lead
        </h1>
        <LeadForm onSuccess={() => window.location.href = "/buyers"} />
      </div>
    </main>
  );
}