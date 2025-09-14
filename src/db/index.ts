import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import path from "path";

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

export const db = drizzle(pool);
