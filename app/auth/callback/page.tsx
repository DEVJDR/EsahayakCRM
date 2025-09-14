"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("CallbackPage: Auth error:", error.message);
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (data.session) {
          await supabase.auth.setSession(data.session);
          console.log("CallbackPage: Session set:", data.session);
          setTimeout(() => {
            router.replace("/buyers");
          }, 500);
        } else {
          console.error("CallbackPage: No session found");
          router.replace("/login?error=No session found");
        }
      } catch (err) {
        console.error("CallbackPage: Unexpected error:", err);
        router.replace("/login?error=Unexpected error");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-gray-600">Finishing login…</p>
    </main>
  );
}