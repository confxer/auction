#!/bin/bash
# 실행 중인 Spring Boot 애플리케이션의 PID를 찾아서 종료
PID=$(pgrep -f 'java -jar.*.jar')
if [ -n "$PID" ]; then
    echo "Stopping server with PID: $PID"
    kill -15 $PID
    sleep 5
else
    echo "No server running."
fi