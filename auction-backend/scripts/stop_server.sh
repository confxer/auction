#!/bin/bash

APP_PATH="/home/ubuntu/app.jar"
PID=$(pgrep -f "java -jar $APP_PATH")

if [ -z "$PID" ]; then
    echo "No server running with $APP_PATH."
    exit 0
fi

echo "Stopping server (PID: $PID) with SIGTERM..."
kill -15 "$PID"

# 종료 대기 (최대 30초)
for i in {1..30}; do
    if ! ps -p "$PID" > /dev/null; then
        echo "Server stopped successfully."
        exit 0
    fi
    echo "Waiting for process $PID to stop... ($i/30)"
    sleep 1
done

echo "Error: Server did not stop gracefully after 30 seconds. Forcing shutdown with SIGKILL."
kill -9 "$PID"
exit 1