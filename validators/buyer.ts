// src/validators/buyer.ts
import { z } from "zod";

export const cities = ["Chandigarh","Mohali","Zirakpur","Panchkula","Other"] as const;
export const propertyTypes = ["Apartment","Villa","Plot","Office","Retail"] as const;
export const bhkOptions = ["1","2","3","4","Studio"] as const;
export const purposeOptions = ["Buy","Rent"] as const;
export const timelineOptions = ["0-3m","3-6m",">6m","Exploring"] as const;
export const sourceOptions = ["Website","Referral","Walk-in","Call","Other"] as const;
export const statusOptions = ["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"] as const;

export const buyerBase = z.object({
  full_name: z.string().min(2).max(80),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be numeric and 10-15 digits"),
  city: z.enum(cities),
  propertyType: z.enum(propertyTypes),
  bhk: z.enum(bhkOptions).optional().nullable(),
  purpose: z.enum(purposeOptions),
  budgetMin: z.number().int().nonnegative().optional().nullable(),
  budgetMax: z.number().int().nonnegative().optional().nullable(),
  timeline: z.enum(timelineOptions),
  source: z.enum(sourceOptions),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  status: z.enum(statusOptions).optional().default("New"),
});

// create schema with refinements
export const buyerCreateSchema = buyerBase.superRefine((data, ctx) => {
  // bhk required for Apartment/Villa
  if (data.propertyType === "Apartment" || data.propertyType === "Villa") {
    if (!data.bhk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bhk is required for Apartment and Villa",
        path: ["bhk"],
      });
    }
  }
  // budget check
  if (data.budgetMin != null && data.budgetMax != null) {
    if (data.budgetMax < data.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be greater than or equal to budgetMin",
        path: ["budgetMax"],
      });
    }
  }
});

export type BuyerCreate = z.infer<typeof buyerBase>;
export type BuyerInput = z.infer<typeof buyerCreateSchema>;
