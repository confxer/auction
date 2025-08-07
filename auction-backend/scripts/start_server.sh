#!/bin/bash

# /home/ubuntu 디렉터리로 이동
cd /home/ubuntu/

# 이전 로그 파일이 있다면 현재 날짜와 시간으로 백업합니다.
if [ -f "nohup.out" ]; then
    mv nohup.out "nohup_$(date +%Y-%m-%d_%H-%M-%S).out"
fi

# 애플리케이션 실행
# buildspec.yml에서 이름을 변경한 고정된 'app.jar'를 사용합니다.
# 이렇게 하면 버전이 바뀌어도 스크립트를 수정할 필요가 없습니다.
echo "Starting application with app.jar"
nohup java -jar -Dspring.profiles.active=prod /home/ubuntu/app.jar > /home/ubuntu/nohup.out 2>&1 &
