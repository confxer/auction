#!/bin/bash
set -e

APP_DIR="/home/ubuntu"
JAR_NAME="app.jar"
LOG_FILE="$APP_DIR/nohup.out"

# 로그 파일 백업
if [ -f "$LOG_FILE" ]; then
    mv "$LOG_FILE" "$APP_DIR/nohup_$(date +%Y-%m-%d_%H-%M-%S).out"
fi

echo "Starting application with Spring profile 'prod'..."

# Spring Cloud AWS가 파라미터를 자동으로 주입하므로, 스크립트에서 처리할 필요 없음
nohup java -jar \
  -Dspring.profiles.active=prod \
  "$APP_DIR/$JAR_NAME" > "$LOG_FILE" 2>&1 &

echo "Application start script finished."