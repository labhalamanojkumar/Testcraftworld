import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse the DATABASE_URL to extract connection parameters
const url = new URL(process.env.DATABASE_URL);

// Create a mysql2 pool with sensible timeouts and options
export const pool = mysql.createPool({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10s connect timeout
  // Keep existing SSL handling for environments with self-signed certs
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema, mode: "default" });

// Try to initialize DB connection with retries. Throws if unrecoverable.
export async function initDB(options?: { retries?: number; delayMs?: number }) {
  const retries = options?.retries ?? 5;
  const delayMs = options?.delayMs ?? 2000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try a lightweight query to validate connection
      const conn = await pool.getConnection();
      try {
        await conn.ping();
      } finally {
        conn.release();
      }
      console.log("Database connection established");
      return;
    } catch (err: any) {
      console.error(
        `Database connection attempt ${attempt} failed: ${err?.message || err}`
      );
      if (attempt === retries) {
        console.error("Exceeded maximum DB connection attempts");
        throw err;
      }
      // exponential backoff
      const wait = delayMs * attempt;
      console.log(`Retrying DB connection in ${wait}ms...`);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
}