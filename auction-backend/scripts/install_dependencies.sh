#!/bin/bash

# /home/ubuntu/ 디렉터리가 없으면 생성합니다.
if [ ! -d /home/ubuntu/ ]; then
    mkdir -p /home/ubuntu/
fi

# /home/ubuntu/scripts 디렉터리가 없으면 생성합니다.
if [ ! -d /home/ubuntu/scripts/ ]; then
    mkdir -p /home/ubuntu/scripts/
fi

# 스크립트 파일들에 실행 권한을 부여합니다.
chmod +x /home/ubuntu/scripts/*.sh
