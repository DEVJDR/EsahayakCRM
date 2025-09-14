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

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setError("Check your email for the magic link!");
    }
  };

  const handleDemoLogin = async () => {
    const demoUser = { id: "demo-user-id", email: "demo@esahayakcrm.com", user_metadata: {} };
    const demoSession = { access_token: "demo-token", refresh_token: "demo-refresh-token", expires_at: Math.floor(Date.now() / 1000) + 3600, user: demoUser };

    // Set the demo session using Supabase client
    await supabase.auth.setSession(demoSession);
    document.cookie = "demo-session=true; path=/; max-age=3600; samesite=lax"; // Set demo cookie

    setSession(demoSession, true);
    // Force redirect after setting session
    console.log("handleDemoLogin: Forcing redirect to /buyers");
    router.push("/buyers");
  };

  // Fallback redirect if user state updates
  useEffect(() => {
    if (user && user.id === "demo-user-id") {
      console.log("useEffect: Redirecting to /buyers due to demo user detection");
      router.push("/buyers");
    }
  }, [user, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">E-Sahayak CRM Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Magic Link
          </button>
        </form>
        <button
          onClick={handleDemoLogin}
          className="w-full mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Demo Login
        </button>
      </div>
    </main>
  );
}