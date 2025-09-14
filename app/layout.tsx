import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "E-Sahayak CRM",
  description: "Lead Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}