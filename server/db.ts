import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse the DATABASE_URL to extract connection parameters
const url = new URL(process.env.DATABASE_URL);

// Create the connection
const connection = mysql.createPool({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false, // For self-signed certificates
  },
});

// Create the database instance
export const db = drizzle(connection, { schema, mode: "default" });