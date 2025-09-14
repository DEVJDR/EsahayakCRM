import {
  pgTable,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define enums
const cityEnum = pgEnum("city", ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
const propertyTypeEnum = pgEnum("property_type", ["Apartment", "Villa", "Plot", "Office", "Retail"]);
const bhkEnum = pgEnum("bhk", ["1", "2", "3", "4", "Studio"]);
const purposeEnum = pgEnum("purpose", ["Buy", "Rent"]);
const timelineEnum = pgEnum("timeline", ["0-3m", "3-6m", ">6m", "Exploring"]);
const sourceEnum = pgEnum("source", ["Website", "Referral", "Walk-in", "Call", "Other"]);
const statusEnum = pgEnum("status", ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]);

// buyers table
export const buyers = pgTable("buyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 254 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: cityEnum("city").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  bhk: bhkEnum("bhk"),
  purpose: purposeEnum("purpose").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: timelineEnum("timeline").notNull(),
  source: sourceEnum("source").notNull().default("Website"),
  status: statusEnum("status").notNull().default("New"),
  notes: text("notes"),
  tags: jsonb("tags").default([]),
  ownerId: uuid("owner_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// buyer_history table
export const buyerHistory = pgTable("buyer_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => buyers.id, { onDelete: "cascade" }),
  changedBy: uuid("changed_by").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
  diff: jsonb("diff").notNull(),
});