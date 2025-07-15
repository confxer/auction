# 🎁 Auction System Database Setup Guide

## 📋 개요
이 문서는 경매 시스템의 데이터베이스 설정 방법을 설명합니다.

## 🗄️ 데이터베이스 정보
- **데이터베이스명**: `auction_db`
- **엔진**: MariaDB 10.x 이상
- **문자셋**: UTF-8 (한글 지원)

## 🚀 설치 및 설정 단계

### 1. MariaDB 설치 (Windows)

#### 방법 1: XAMPP 사용 (권장)
1. [XAMPP 다운로드](https://www.apachefriends.org/download.html)
2. 설치 후 XAMPP Control Panel 실행
3. MySQL 서비스 시작
4. phpMyAdmin 접속: `http://localhost/phpmyadmin`

#### 방법 2: MariaDB 직접 설치
1. [MariaDB 다운로드](https://mariadb.org/download/)
2. 설치 시 root 비밀번호 설정: `1234`
3. MySQL Workbench 또는 HeidiSQL 설치

### 2. 데이터베이스 생성

#### phpMyAdmin 사용
1. phpMyAdmin 접속
2. 새 데이터베이스 생성: `auction_db`
3. 문자셋: `utf8mb4_unicode_ci`

#### 명령줄 사용
```sql
CREATE DATABASE auction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 스키마 실행

#### 방법 1: phpMyAdmin
1. `auction_db` 선택
2. SQL 탭 클릭
3. `database_schema.sql` 파일 내용 복사하여 실행

#### 방법 2: 명령줄
```bash
mysql -u root -p auction_db < database_schema.sql
```

### 4. 연결 설정 확인

#### application.properties 설정
```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/auction_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=1234
```

## 📊 데이터베이스 구조

### 주요 테이블

#### 1. auction (경매 정보)
- 경매 기본 정보 (제목, 카테고리, 가격 등)
- 이미지 URL, 설명, 시간 설정
- 경매 상태 및 낙찰자 정보

#### 2. bids (입찰 내역)
- 입찰자, 입찰 금액, 입찰 시간
- 경매 ID와 외래키 연결

#### 3. users (사용자 정보) - 향후 확장용
- 사용자 인증 정보
- 프로필 및 권한 관리

#### 4. comments (댓글) - 향후 확장용
- 경매별 댓글 시스템

#### 5. notifications (알림) - 향후 확장용
- 실시간 알림 시스템

#### 6. statistics (통계) - 향후 확장용
- 경매 통계 및 분석

### 샘플 데이터
- 8개의 다양한 경매 상품
- 11개의 샘플 입찰 데이터
- 다양한 카테고리 (전자제품, 패션, 명품, 가전)

## 🔧 유용한 SQL 쿼리

### 활성 경매 조회
```sql
SELECT * FROM auction WHERE is_closed = FALSE AND end_time > NOW();
```

### 경매별 입찰 통계
```sql
SELECT 
    a.title,
    COUNT(b.id) as bid_count,
    MAX(b.bid_amount) as highest_bid
FROM auction a
LEFT JOIN bids b ON a.id = b.auction_id
GROUP BY a.id;
```

### 카테고리별 경매 수
```sql
SELECT category, COUNT(*) as count
FROM auction
GROUP BY category;
```

## 🛠️ 문제 해결

### 1. 연결 오류
- MariaDB 서비스가 실행 중인지 확인
- 포트 3306이 사용 가능한지 확인
- 사용자명/비밀번호 확인

### 2. 한글 깨짐
- 데이터베이스 문자셋이 `utf8mb4`인지 확인
- JDBC URL에 `characterEncoding=UTF-8` 추가

### 3. 권한 오류
```sql
GRANT ALL PRIVILEGES ON auction_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 📈 성능 최적화

### 인덱스
- 주요 검색 필드에 인덱스 생성
- 입찰 테이블의 auction_id, bid_time 인덱스

### 뷰
- `active_auctions`: 활성 경매 목록
- `auction_stats`: 경매 통계 정보

### 트리거
- 입찰 시 최고가 자동 업데이트

## 🔄 백업 및 복원

### 백업
```bash
mysqldump -u root -p auction_db > auction_backup.sql
```

### 복원
```bash
mysql -u root -p auction_db < auction_backup.sql
```

## ✅ 확인 사항

설정 완료 후 다음을 확인하세요:

1. ✅ MariaDB 서비스 실행 중
2. ✅ auction_db 데이터베이스 생성됨
3. ✅ 모든 테이블 생성됨
4. ✅ 샘플 데이터 삽입됨
5. ✅ Spring Boot 애플리케이션 연결 성공
6. ✅ 경매 목록 조회 가능
7. ✅ 입찰 기능 정상 작동

## 🎯 다음 단계

데이터베이스 설정이 완료되면:

1. **Spring Boot 애플리케이션 실행**
2. **React 프론트엔드 실행**
3. **경매 등록 테스트**
4. **입찰 기능 테스트**
5. **실시간 업데이트 테스트**

---

**📞 문제가 발생하면 로그를 확인하고 위의 문제 해결 섹션을 참조하세요.** 