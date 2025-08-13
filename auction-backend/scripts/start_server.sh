#!/bin/bash

# 스크립트 실행 중 오류가 발생하면 즉시 중단하도록 설정
set -e

# /home/ubuntu 디렉터리로 이동
cd /home/ubuntu/

# 이전 로그 파일이 있다면 현재 날짜와 시간으로 백업합니다.
if [ -f "nohup.out" ]; then
    mv nohup.out "nohup_$(date +%Y-%m-%d_%H-%M-%S).out"
fi

# AWS Systems Manager Parameter Store에서 환경 변수 가져오기
# (EC2 인스턴스의 IAM 역할에 SSM 읽기 권한이 필요합니다)
echo "Fetching secrets from Parameter Store..."

# 각 파라미터를 가져오고, 성공/실패 여부를 명확히 로그에 남깁니다.
# 오류는 별도의 로그 파일에 기록하여 디버깅에 사용합니다.
DB_PASSWORD=$(aws ssm get-parameter --name "/auction/prod/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2 2>/tmp/ssm_error.log)
if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch DB_PASSWORD. See /tmp/ssm_error.log for details." >&2
    exit 1
fi
echo "Successfully fetched DB_PASSWORD."

JWT_SECRET_KEY=$(aws ssm get-parameter --name "/auction/prod/JWT_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2 2>/tmp/ssm_error.log)
if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch JWT_SECRET_KEY. See /tmp/ssm_error.log for details." >&2
    exit 1
fi
echo "Successfully fetched JWT_SECRET_KEY."

TOSS_SECRET_KEY=$(aws ssm get-parameter --name "/auction/prod/TOSS_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2 2>/tmp/ssm_error.log)
if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch TOSS_SECRET_KEY. See /tmp/ssm_error.log for details." >&2
    exit 1
fi
echo "Successfully fetched TOSS_SECRET_KEY."

# 애플리케이션 실행 시, 가져온 비밀 값들을 시스템 속성(-D)으로 주입합니다.
echo "Starting application with app.jar and production profile..."
nohup java -jar \
  -Dspring.profiles.active=prod \
  -Ddb.password="$DB_PASSWORD" \
  -Djwt.secret.key="$JWT_SECRET_KEY" \
  -Dtoss.secret.key="$TOSS_SECRET_KEY" \
  /home/ubuntu/app.jar > /home/ubuntu/nohup.out 2>&1 &

# 스크립트가 성공적으로 끝났음을 CodeDeploy에 알리기 위해 마지막 로그를 남깁니다.
echo "Application start script finished successfully."
