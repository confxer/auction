#!/bin/bash

# /home/ubuntu 디렉터리로 이동
cd /home/ubuntu/

# 이전 로그 파일이 있다면 현재 날짜와 시간으로 백업합니다.
if [ -f "nohup.out" ]; then
    mv nohup.out "nohup_$(date +%Y-%m-%d_%H-%M-%S).out"
fi

# AWS Systems Manager Parameter Store에서 환경 변수 가져오기
# (EC2 인스턴스의 IAM 역할에 SSM 읽기 권한이 필요합니다)
echo "Fetching secrets from Parameter Store..."
DB_PASSWORD=$(aws ssm get-parameter --name "/auction/prod/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2)
JWT_SECRET_KEY=$(aws ssm get-parameter --name "/auction/prod/JWT_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2)
TOSS_SECRET_KEY=$(aws ssm get-parameter --name "/auction/prod/TOSS_SECRET_KEY" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2)
# 필요한 다른 환경 변수들도 여기에 추가합니다 (GMAIL_USERNAME, GMAIL_APP_PASSWORD 등)
# 예: GMAIL_USERNAME=$(aws ssm get-parameter --name "/auction/gmail/username" --with-decryption --query "Parameter.Value" --output text --region ap-northeast-2)


# 환경 변수가 제대로 로드되었는지 확인 (비밀번호는 로그에 남기지 않도록 주의)
if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET_KEY" ]; then
    echo "Error: Failed to fetch one or more secrets from Parameter Store. Aborting." >&2
    exit 1
fi

# 애플리케이션 실행 시, 가져온 비밀 값들을 시스템 속성(-D)으로 주입합니다.
echo "Starting application with app.jar and production profile..."
nohup java -jar \
  -Dspring.profiles.active=prod \
  -Ddb.password="$DB_PASSWORD" \
  -Djwt.secret.key="$JWT_SECRET_KEY" \
  -Dtoss.secret.key="$TOSS_SECRET_KEY" \
  /home/ubuntu/app.jar > /home/ubuntu/nohup.out 2>&1 &
