# /home/ubuntu/scripts/validate_service.sh

#!/bin/bash
# 10번 재시도, 5초 간격으로 로컬호스트 8080 포트의 health check URL을 호출
for i in {1..10}; do
    # Spring Actuator의 health check endpoint를 호출하여 HTTP 200 응답을 확인
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health)
    if [ "$response" -eq 200 ]; then
        echo "Validation successful on attempt $i"
        exit 0 # 성공 시 0을 반환하고 종료
    fi
    echo "Validation attempt $i failed with status $response. Retrying in 5 seconds..."
    sleep 5
done

echo "Error: Service validation failed after multiple attempts."
exit 1 # 실패 시 1을 반환