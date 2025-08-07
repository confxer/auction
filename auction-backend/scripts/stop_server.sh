#!/bin/bash

# '/home/ubuntu/app.jar'를 실행 중인 프로세스의 PID를 찾습니다.
# 이렇게 하면 다른 Java 애플리케이션을 실수로 종료하는 것을 방지할 수 있습니다.
PID=$(pgrep -f 'java -jar /home/ubuntu/app.jar')

if [ -n "$PID" ]; then
    echo "Stopping server (app.jar) with PID: $PID"
    # SIGTERM (15) 신호를 보내서 정상적으로 종료를 시도합니다.
    kill -15 $PID
    # 프로세스가 종료될 시간을 잠시 기다립니다.
    sleep 5
else
    echo "No server running with app.jar."
fi
