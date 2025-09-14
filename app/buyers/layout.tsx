"use client";

import { useAuth } from "@/components/AuthProvider";

export default function BuyersLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log("BuyersLayout: loading =", loading, "user =", user);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null; // Middleware will redirect to /login
  }

  return <>{children}</>;
}