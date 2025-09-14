"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}