// src/lib/auth.ts
export async function getCurrentUserId(req?: Request): Promise<string> {
  // TODO: Replace with Supabase server-side session check.
  // For now return demo user id for testing
  return "00000000-0000-0000-0000-000000000000";
}
