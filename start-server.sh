#!/bin/bash

# BlogStreamPro Auto-Restart Server Script
# This script ensures the server stays running and automatically restarts on crashes

PROJECT_DIR="/Users/manojkumar/Desktop/Work flow/BlogStreamPro"
LOG_FILE="$PROJECT_DIR/server.log"
PID_FILE="$PROJECT_DIR/server.pid"
PORT=3000

echo "🚀 Starting BlogStreamPro Auto-Restart Server..."
echo "📁 Project Directory: $PROJECT_DIR"
echo "📄 Log File: $LOG_FILE"
echo "🔢 Port: $PORT"

# Function to check if server is responding
check_server() {
    if curl -s --connect-timeout 3 "http://localhost:$PORT/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start server
start_server() {
    echo "$(date): Starting server..." >> "$LOG_FILE"

    cd "$PROJECT_DIR"

    # Kill any existing server processes
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            echo "$(date): Killing old server process $OLD_PID" >> "$LOG_FILE"
            kill "$OLD_PID" 2>/dev/null
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi

    # Kill any processes on the target port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

    # Start the server
    PORT=$PORT npm run dev >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"

    echo "$(date): Server started with PID $SERVER_PID" >> "$LOG_FILE"
}

# Function to stop server
stop_server() {
    echo "$(date): Stopping server..." >> "$LOG_FILE"

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null
            sleep 2
            if kill -0 "$PID" 2>/dev/null; then
                kill -9 "$PID" 2>/dev/null
            fi
        fi
        rm -f "$PID_FILE"
    fi

    # Also kill any processes on the target port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

    echo "$(date): Server stopped" >> "$LOG_FILE"
}

# Function to restart server
restart_server() {
    echo "$(date): Restarting server..." >> "$LOG_FILE"
    stop_server
    sleep 3
    start_server
}

# Trap signals
trap 'echo "$(date): Received signal, stopping server..." >> "$LOG_FILE"; stop_server; exit 0' INT TERM

# Initial start
start_server

# Monitor loop
RESTART_COUNT=0
MAX_RESTARTS=10
CHECK_INTERVAL=10

echo "🔄 Monitoring server health..."
echo "📊 Check interval: $CHECK_INTERVAL seconds"
echo "🔄 Max restarts: $MAX_RESTARTS"
echo "📝 Logs: $LOG_FILE"
echo "🛑 Press Ctrl+C to stop"

while true; do
    sleep $CHECK_INTERVAL

    if ! check_server; then
        echo "$(date): ❌ Server not responding, attempting restart ($((RESTART_COUNT + 1))/$MAX_RESTARTS)" >> "$LOG_FILE"
        echo "$(date): ❌ Server not responding, attempting restart ($((RESTART_COUNT + 1))/$MAX_RESTARTS)"

        if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
            echo "$(date): ❌ Max restarts reached, giving up" >> "$LOG_FILE"
            echo "❌ Max restarts reached, giving up"
            stop_server
            exit 1
        fi

        restart_server
        RESTART_COUNT=$((RESTART_COUNT + 1))

        # Wait a bit longer after restart
        sleep 5
    else
        # Reset restart count on successful check
        if [ $RESTART_COUNT -gt 0 ]; then
            echo "$(date): ✅ Server is healthy again" >> "$LOG_FILE"
            RESTART_COUNT=0
        fi
    fi
done