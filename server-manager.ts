#!/usr/bin/env node

/**
 * BlogStreamPro Server Manager
 * Auto-restart server with proper error handling and monitoring
 */

import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'http';
import * as path from 'path';
import * as fs from 'fs';

const PROJECT_DIR = path.resolve(process.cwd());
const PORT = parseInt(process.env.PORT || '3000', 10);
const LOG_FILE = path.join(PROJECT_DIR, 'server.log');
const PID_FILE = path.join(PROJECT_DIR, 'server.pid');

let serverProcess: ChildProcess | null = null;
let restartCount = 0;
const MAX_RESTARTS = 10;
const CHECK_INTERVAL = 10000; // 10 seconds
const STARTUP_TIMEOUT = 15000; // 15 seconds

console.log('🚀 BlogStreamPro Server Manager Starting...');
console.log(`📁 Project: ${PROJECT_DIR}`);
console.log(`🔢 Port: ${PORT}`);
console.log(`📄 Logs: ${LOG_FILE}`);

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Logging function
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Clean up function
function cleanup() {
  log('🧹 Cleaning up...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  }

  // Remove PID file
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }

  process.exit(0);
}

// Health check function
async function checkServerHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = createServer((req, res) => {
      // Simple health check
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    req.listen(0, 'localhost', () => {
      const testReq = req.address() as any;
      const client = createServer();

      client.on('connect', () => {
        client.end();
        req.close();
        resolve(true);
      });

      client.on('error', () => {
        req.close();
        resolve(false);
      });

      // Try to connect to the actual server
      const net = require('net');
      const socket = net.createConnection({ port: PORT, host: 'localhost' }, () => {
        socket.end();
        req.close();
        resolve(true);
      });

      socket.on('error', () => {
        req.close();
        resolve(false);
      });

      // Timeout after 3 seconds
      setTimeout(() => {
        req.close();
        resolve(false);
      }, 3000);
    });
  });
}

// Start server function
function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting server (attempt ${restartCount + 1}/${MAX_RESTARTS})`);

    // Kill any existing processes on the port
    try {
      const { execSync } = require('child_process');
      execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors
    }

    const env = { ...process.env, PORT: PORT.toString(), NODE_ENV: 'development' };
    serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
      cwd: PROJECT_DIR,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    if (!serverProcess) {
      reject(new Error('Failed to spawn server process'));
      return;
    }

    // Write PID file
    fs.writeFileSync(PID_FILE, serverProcess.pid!.toString());

    let startupTimeout: NodeJS.Timeout;
    let isStarted = false;

    // Handle stdout
    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      log(`📝 ${output.trim()}`);

      // Check if server started successfully
      if (output.includes('serving on port') && !isStarted) {
        isStarted = true;
        clearTimeout(startupTimeout);
        log('✅ Server started successfully');
        resolve();
      }
    });

    // Handle stderr
    serverProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      log(`❌ ${error.trim()}`);
    });

    // Handle process exit
    serverProcess.on('exit', (code, signal) => {
      log(`⚠️  Server process exited with code ${code}, signal ${signal}`);
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
      serverProcess = null;
    });

    // Startup timeout
    startupTimeout = setTimeout(() => {
      if (!isStarted) {
        log('⏰ Server startup timeout');
        if (serverProcess) {
          serverProcess.kill('SIGTERM');
        }
        reject(new Error('Server startup timeout'));
      }
    }, STARTUP_TIMEOUT);
  });
}

// Restart server function
async function restartServer() {
  log('🔄 Restarting server...');

  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  try {
    await startServer();
    restartCount = 0; // Reset restart count on success
    log('✅ Server restarted successfully');
  } catch (error) {
    log(`❌ Failed to restart server: ${error}`);
    restartCount++;

    if (restartCount >= MAX_RESTARTS) {
      log(`💀 Max restarts (${MAX_RESTARTS}) reached. Giving up.`);
      cleanup();
      return;
    }

    // Try again after a delay
    setTimeout(() => restartServer(), 5000);
  }
}

// Monitor function
async function monitorServer() {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));

    try {
      const isHealthy = await checkServerHealth();

      if (!isHealthy) {
        log('❌ Server health check failed');
        await restartServer();
      } else if (restartCount > 0) {
        log('✅ Server is healthy again');
        restartCount = 0;
      }
    } catch (error) {
      log(`❌ Health check error: ${error}`);
    }
  }
}

// Signal handlers
process.on('SIGINT', () => {
  log('🛑 Received SIGINT, shutting down...');
  cleanup();
});

process.on('SIGTERM', () => {
  log('🛑 Received SIGTERM, shutting down...');
  cleanup();
});

// Start the server manager
async function main() {
  try {
    log('🔍 Checking for existing server processes...');

    // Kill any existing server processes
    try {
      const { execSync } = require('child_process');
      execSync(`pkill -f "tsx server/index.ts" 2>/dev/null || true`, { stdio: 'ignore' });
      execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors
    }

    await startServer();
    log('🎉 Server manager started successfully');
    log(`🔄 Monitoring every ${CHECK_INTERVAL / 1000} seconds`);
    log('🛑 Press Ctrl+C to stop');

    // Start monitoring
    monitorServer();

  } catch (error) {
    log(`💀 Failed to start server manager: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`💀 Unhandled error: ${error}`);
  cleanup();
});