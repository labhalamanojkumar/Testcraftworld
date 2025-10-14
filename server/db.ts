import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import * as schema from "../shared/schema";
import * as net from "net";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse the DATABASE_URL to extract connection parameters
const url = new URL(process.env.DATABASE_URL);

// Detect SSL requirement from the URL query params (e.g. ?ssl-mode=REQUIRED)
const sslMode = (url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode') || '').toLowerCase();
const useSsl = sslMode === 'required' || sslMode === 'verify_ca' || sslMode === 'verify_identity';

// Normalize host to prefer IPv4 localhost when appropriate (avoid ::1 when MySQL is IPv4-only)
function normalizeHost(hostname: string) {
  // allow an explicit override via DB_HOST env var
  const envHost = process.env.DB_HOST;
  if (envHost) return envHost;

  if (!hostname) return '127.0.0.1';

  // If hostname is localhost or resolves to IPv6 loopback, prefer 127.0.0.1
  if (hostname === 'localhost' || hostname === '::1' || hostname === '[::1]') {
    return '127.0.0.1';
  }

  return hostname;
}

// Create an initial mysql2 pool with sensible timeouts and options.
// This may be replaced later if we detect the DB listens on a different common port.
export let pool = mysql.createPool({
  host: normalizeHost(url.hostname),
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10s connect timeout
  // Configure SSL only when required by the DATABASE_URL (Coolify often requires SSL)
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

// Create the drizzle database instance (may be re-created if pool changes)
export let db = drizzle(pool, { schema, mode: "default" });

// Enhanced database connection utilities to prevent SSL and connection issues

export async function validateDatabaseConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return { success: true, message: "Database connection validated" };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection failed: ${error.message}`,
      error: error.code || 'UNKNOWN_ERROR'
    };
  }
}

export async function ensureDatabaseTables() {
  const conn = await pool.getConnection();
  try {
    // Check if tables exist and create them if needed
    const tables = ['articles', 'categories', 'users'];
    for (const table of tables) {
      const [rows] = await conn.execute(
        `SHOW TABLES LIKE '${table}'`
      );
      if ((rows as any[]).length === 0) {
        console.warn(`Table '${table}' does not exist. Please run database migrations.`);
      }
    }
  } finally {
    conn.release();
  }
}

// Connection health monitoring
export function startConnectionMonitoring(intervalMs = 30000) {
  setInterval(async () => {
    const health = await validateDatabaseConnection();
    if (!health.success) {
      console.error('Database connection health check failed:', health.message);
      // In production, you might want to send alerts or attempt reconnection
    }
  }, intervalMs);
}

function tcpCheck(host: string, port: number, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    const onError = (err: any) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(err);
      }
    };

    socket.setTimeout(timeoutMs, () => onError(new Error("TCP connect timeout")));
    socket.once("error", onError);
    socket.connect(port, host, () => {
      if (!settled) {
        settled = true;
        socket.end();
        resolve();
      }
    });
  });
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

// Try to initialize DB connection with retries. Throws if unrecoverable.
export async function initDB(options?: { retries?: number; delayMs?: number }) {
  const retries = options?.retries ?? 5;
  const delayMs = options?.delayMs ?? 2000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // First check raw TCP connectivity to make the root cause clearer
      const host = url.hostname;
      const port = parseInt(url.port);
      try {
        await tcpCheck(host, port, 5000);
      } catch (tcpErr) {
        console.warn(`TCP check to ${host}:${port} failed: ${errMsg(tcpErr)}`);
        // Try common MySQL port 3306 as a fallback before failing
        const fallbackPort = 3306;
        try {
          console.log(`Attempting TCP fallback to ${host}:${fallbackPort}...`);
          await tcpCheck(host, fallbackPort, 5000);
          console.log(`Fallback TCP to ${host}:${fallbackPort} succeeded — recreating pool to use fallback port`);
          // Recreate pool and db to use fallback port
          await pool.end().catch(() => {});
          pool = mysql.createPool({
            host,
            port: fallbackPort,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000,
            ssl: { rejectUnauthorized: false },
          });
          db = drizzle(pool, { schema, mode: "default" });
        } catch (fallbackErr) {
          console.warn(`Fallback TCP to ${host}:3306 failed: ${errMsg(fallbackErr)}`);
          // if fallback also failed, continue to attempt using existing pool pings below
        }
      }

      // Now try a lightweight query to validate connection
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