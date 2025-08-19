# Dockerfile

# --- 1. 빌드 스테이지 ---
# Gradle을 사용하여 애플리케이션을 빌드하는 임시 컨테이너 환경을 정의합니다.
# 이 스테이지의 결과물은 오직 .jar 파일입니다.
FROM gradle:8.7-jdk17-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /build

# 소스코드 전체를 컨테이너 안으로 복사
COPY . .

# Gradle Wrapper를 사용하여 테스트를 제외하고 애플리케이션을 빌드합니다.
# 이 명령은 기존 buildspec.yml의 빌드 명령어와 동일합니다.
RUN ./gradlew build -x test


# --- 2. 최종 실행 스테이지 ---
# 실제 애플리케이션을 실행할 최종 이미지를 정의합니다.
# Java 17만 설치된 가벼운 이미지를 사용하여 효율성을 높입니다.
FROM amazoncorretto:17-alpine-jdk

# 작업 디렉토리 설정
WORKDIR /app

# 위 'builder' 스테이지에서 빌드된 .jar 파일만 최종 이미지로 복사합니다.
# 이렇게 하면 소스코드나 빌드 도구 없이 깔끔한 실행 환경이 만들어집니다.
COPY --from=builder /build/build/libs/*.jar app.jar

# 애플리케이션이 8080 포트를 사용함을 명시합니다.
EXPOSE 8080

# 컨테이너가 시작될 때 실행할 명령어를 정의합니다.
# 기존 start_server.sh의 java -jar ... 명령어와 동일한 역할을 합니다.
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
