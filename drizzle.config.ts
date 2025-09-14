import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") }); // Adjust path if needed

const config: Config = {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Must be defined in .env
  },
};

export default config;