import { db } from "./index";
import { buyers } from "./schema";

async function seed() {
  await db.insert(buyers).values({
    fullName: "Arun Kumar",
    email: "arun@example.com",
    phone: "9876543210",
    city: "Gurgaon",
    propertyType: "Apartment",
    bhk: "3BHK",
    purpose: "Buy",
    budgetMin: 5000000,
    budgetMax: 8000000,
    timeline: "3 months",
    source: "Website",
    ownerId: "uuid-of-test-agent",
  });
}

seed().then(() => console.log("Seeded buyers"));
