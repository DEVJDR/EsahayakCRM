"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export default function LoginPage() {
  const router = useRouter();
  const { setSession, session, user } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    const demoUser = { id: "demo-user-id", email: "demo@esahayakcrm.com", user_metadata: {} };
    const demoSession = { access_token: "demo-token", refresh_token: "demo-refresh-token", expires_at: Math.floor(Date.now() / 1000) + 3600, user: demoUser };

    await supabase.auth.setSession(demoSession);
    document.cookie = "demo-session=true; path=/; max-age=3600; samesite=lax";

    setSession(demoSession, true);
    console.log("handleDemoLogin: Forcing redirect to /buyers");
    router.push("/buyers");
  };

  useEffect(() => {
    if (user && user.id === "demo-user-id") {
      console.log("useEffect: Redirecting to /buyers due to demo user detection");
      router.push("/buyers");
    }
  }, [user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">
          E-Sahayak CRM Login
        </h1>
        {error && (
          <p className="text-red-600 mb-6 text-center bg-red-100 p-3 rounded-lg">
            {error}
          </p>
        )}
        <div className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg placeholder-gray-500 transition-all duration-200"
            required
          />
          <button
            onClick={handleDemoLogin}
            className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-lg font-semibold shadow-md hover:shadow-lg"
          >
            Demo Login
          </button>
        </div>
      </div>
    </main>
  );
}