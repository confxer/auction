#!/bin/bash

# /home/ubuntu/ 경로에 있는 모든 파일의 소유자를 ubuntu 사용자로 변경합니다.
chown -R ubuntu:ubuntu /home/ubuntu/

# /home/ubuntu/scripts/ 경로에 있는 모든 .sh 파일에 실행 권한을 부여합니다.
chmod +x /home/ubuntu/scripts/*.sh
