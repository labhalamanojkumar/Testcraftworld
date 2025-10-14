# BlogStreamPro - Server Management Guide

## 🚀 Starting the Server

### Option 1: Standard Development Server (Recommended)
```bash
# Start the server
npm run dev

# Or with explicit port
PORT=3000 npm run dev
```

### Option 2: Auto-Restart Server (For Production/Development)
```bash
# Start with auto-restart capability
npm run dev:restart
```

### Option 3: Check Server Status
```bash
# Check if server is running and accessible
npm run status
```

## 🔧 Troubleshooting ERR_CONNECTION_REFUSED

### Quick Fix Steps:
1. **Check server status:**
   ```bash
   npm run status
   ```

2. **Kill conflicting processes:**
   ```bash
   # Kill all processes on port 3000
   lsof -ti:3000 | xargs kill -9 2>/dev/null || true

   # Kill any tsx server processes
   pkill -f "tsx server/index.ts" 2>/dev/null || true
   ```

3. **Start fresh:**
   ```bash
   PORT=3000 npm run dev
   ```

### Common Issues & Solutions:

#### Issue: Port 3000 already in use
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```
**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Start server
PORT=3000 npm run dev
```

#### Issue: Server crashes on startup
**Solution:**
```bash
# Check database connection
# Ensure DATABASE_URL is set correctly in .env

# Check logs
tail -f server.log

# Start with auto-restart
npm run dev:restart
```

#### Issue: Database connection fails
**Solution:**
```bash
# Check DATABASE_URL format
# Should be: mysql://user:password@host:port/database?ssl-mode=REQUIRED

# For local development, ensure MySQL is running
# For remote databases, ensure SSL is enabled
```

## 📊 Server Health Monitoring

### Check Server Health:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T16:53:41.928Z",
  "service": "BlogStreamPro",
  "version": "1.0.0"
}
```

### Monitor Server Logs:
```bash
tail -f server.log
```

## 🔄 Auto-Restart Configuration

The server now includes:
- ✅ **Error handling** for startup failures
- ✅ **Graceful shutdown** on SIGINT/SIGTERM
- ✅ **Port conflict detection** with helpful messages
- ✅ **Auto-restart script** (`npm run dev:restart`)
- ✅ **Health monitoring** (`npm run status`)

## 🌐 Accessing Your Application

Once running, access at:
- **Main App:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **User Dashboard:** http://localhost:3000/dashboard
- **API Health:** http://localhost:3000/health

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Start with auto-restart
npm run dev:restart

# Check server status
npm run status

# Build for production
npm run build

# Start production server
npm run start
```

## 📝 Logs & Debugging

- **Server logs:** `server.log`
- **Process ID:** `server.pid` (when using auto-restart)
- **Health checks:** `npm run status`

## 🚨 Emergency Stop

```bash
# Stop all server processes
pkill -f "tsx server/index.ts"

# Kill by port
lsof -ti:3000 | xargs kill -9

# Clean up PID files
rm -f server.pid
```