// src/lib/rateLimit.ts
const map = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  let entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }
  entry.count++;
  map.set(key, entry);
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}
