// tests/validators.test.ts
import { describe, it, expect } from "vitest";
import { buyerCreateSchema } from "@/src/validators/buyer";

describe("budget validator", () => {
  it("accepts budgetMax >= budgetMin", () => {
    const ok = buyerCreateSchema.safeParse({
      fullName: "A",
      phone: "9876543210",
      city: "Other",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 1000,
      budgetMax: 2000,
    });
    expect(ok.success).toBe(true);
  });

  it("rejects budgetMax < budgetMin", () => {
    const bad = buyerCreateSchema.safeParse({
      fullName: "A",
      phone: "9876543210",
      city: "Other",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 5000,
      budgetMax: 2000,
    });
    expect(bad.success).toBe(false);
  });
});
