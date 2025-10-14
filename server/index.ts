import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("Starting server initialization...");
  // Ensure DB is available before registering routes
  try {
    const { initDB, validateDatabaseConnection, ensureDatabaseTables } = await import("./db");

    console.log("🔌 Initializing database connection...");
    await initDB({ retries: 6, delayMs: 2000 });

    // Validate connection
    const healthCheck = await validateDatabaseConnection();
    if (!healthCheck.success) {
      console.error("❌ Database health check failed:", healthCheck.message);
      console.error("💡 Common fixes:");
      console.error("   - Check DATABASE_URL format and credentials");
      console.error("   - Ensure SSL mode is correctly set for remote databases");
      console.error("   - Verify database server is accessible");
      console.error("   - Check firewall and network connectivity");
      process.exit(1);
    }
    console.log("✅ Database connection established");

    // Ensure tables exist
    await ensureDatabaseTables();

  } catch (err: any) {
    console.error("❌ Database initialization failed:", err.message);
    console.error("🔧 Troubleshooting steps:");
    console.error("1. Verify DATABASE_URL format:");
    console.error("   mysql://user:password@host:port/database?ssl-mode=REQUIRED");
    console.error("2. For Coolify/remote databases, ensure SSL is enabled");
    console.error("3. Check network connectivity to database host");
    console.error("4. Verify database credentials and permissions");
    process.exit(1);
  }

  const server = await registerRoutes(app);
  console.log("Routes registered successfully");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log("Setting up Vite for development...");
    await setupVite(app, server);
    console.log("Vite setup completed");
  } else {
    console.log("Setting up static file serving for production...");
    serveStatic(app);
    console.log("Static file serving setup completed");
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  console.log(`Attempting to start server on port ${port}...`);

  // Add error handling for server startup
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  }).on('error', (err: any) => {
    console.error(`❌ Failed to start server on port ${port}:`, err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`💡 Port ${port} is already in use. Try a different port or kill the process using it.`);
    }
    process.exit(1);
  });

  // Handle process termination gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
      process.exit(1);
    });
  });
})();
