-- 좋아요 기능을 위한 데이터베이스 스키마 실행 방법

-- 1. MySQL에 접속
-- mysql -u root -p

-- 2. 데이터베이스 선택
-- USE auction_db;

-- 3. favorites_schema.sql 파일 실행
-- source favorites_schema.sql;

-- 또는 직접 실행:
-- CREATE TABLE IF NOT EXISTS favorites (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     auction_id BIGINT NOT NULL,
--     user_id VARCHAR(50) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE KEY unique_user_auction (user_id, auction_id),
--     FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
-- );

-- 인덱스 추가
-- CREATE INDEX idx_favorites_user_id ON favorites(user_id);
-- CREATE INDEX idx_favorites_auction_id ON favorites(auction_id);
-- CREATE INDEX idx_favorites_created_at ON favorites(created_at);

-- 테이블 생성 확인
-- SHOW TABLES LIKE 'favorites';
-- DESCRIBE favorites; 