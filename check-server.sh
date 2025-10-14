#!/bin/bash

# BlogStreamPro Server Status Checker
# Quick script to check if the server is running and accessible

PORT=3000
PROJECT_DIR="/Users/manojkumar/Desktop/Work flow/BlogStreamPro"
PID_FILE="$PROJECT_DIR/server.pid"
LOG_FILE="$PROJECT_DIR/server.log"

echo "🔍 Checking BlogStreamPro Server Status..."
echo "🔢 Port: $PORT"
echo "📁 Project: $PROJECT_DIR"

# Check if PID file exists and process is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "✅ Server process is running (PID: $PID)"
    else
        echo "❌ Server process not found (stale PID file)"
        rm -f "$PID_FILE"
    fi
else
    echo "❌ No server PID file found"
fi

# Check if port is in use
if lsof -i :$PORT > /dev/null 2>&1; then
    PORT_PID=$(lsof -ti:$PORT)
    echo "✅ Port $PORT is in use (PID: $PORT_PID)"
else
    echo "❌ Port $PORT is not in use"
fi

# Test server health
echo "🌐 Testing server connectivity..."
if curl -s --connect-timeout 5 "http://localhost:$PORT/health" > /dev/null 2>&1; then
    echo "✅ Server is responding to health checks"
    echo "🎉 Server appears to be fully operational!"
    echo ""
    echo "🌐 Access your application at: http://localhost:$PORT"
    echo "📊 Admin dashboard: http://localhost:$PORT/admin"
    echo "👤 User dashboard: http://localhost:$PORT/dashboard"
else
    echo "❌ Server is not responding to health checks"
    echo ""
    echo "💡 Try running: npm run dev:auto"
    echo "📄 Check logs: tail -f $LOG_FILE"
fi

echo ""
echo "📝 Recent logs:"
if [ -f "$LOG_FILE" ]; then
    tail -5 "$LOG_FILE" 2>/dev/null || echo "No recent logs"
else
    echo "No log file found"
fi