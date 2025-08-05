#!/bin/bash
# 스크립트가 실행되는 위치를 /home/ubuntu로 변경
cd /home/ubuntu/

# jar 파일의 정확한 이름을 찾아서 변수에 저장 (하나만 있다고 가정)
JAR_NAME=$(ls -t *.jar | head -n 1)

# 이전 로그 파일 백업
if [ -f "nohup.out" ]; then
    mv nohup.out "nohup_$(date +%Y-%m-%d_%H-%M-%S).out"
fi

# 애플리케이션 실행 (찾아낸 jar 이름 사용)
nohup java -jar -Dspring.profiles.active=prod $JAR_NAME > /home/ubuntu/nohup.out 2>&1 &