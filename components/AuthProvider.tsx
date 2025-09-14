"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

const AuthContext = createContext<{
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  setSession: (session: Session | null, isDemo?: boolean) => void;
}>({
  session: null,
  user: null,
  loading: true,
  setSession: () => {},
});

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("AuthProvider: Error fetching initial session:", error.message);
      else {
        console.log("AuthProvider: Initial session:", session);
        setSessionState(session);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: Auth state changed:", session);
      setSessionState(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setSession = (newSession: Session | null, isDemo = false) => {
    console.log("AuthProvider: setSession called with isDemo:", isDemo, "Session:", newSession);
    if (newSession) {
      if (isDemo) {
        console.log("AuthProvider: Setting demo session locally:", newSession);
        setSessionState((prev) => ({ ...prev, ...newSession })); // Force update
      } else {
        console.log("AuthProvider: Attempting to set real session with Supabase:", newSession);
        supabase.auth.setSession(newSession).then(({ error }) => {
          if (error) console.error("AuthProvider: Error setting session:", error.message);
          else {
            setSessionState(newSession);
            console.log("AuthProvider: Session set successfully:", newSession);
          }
        });
      }
    } else {
      setSessionState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}