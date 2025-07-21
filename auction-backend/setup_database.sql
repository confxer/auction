-- 경매 시스템 데이터베이스 설정 스크립트

-- 1. users 테이블에 name 컬럼 추가
ALTER TABLE users ADD COLUMN name VARCHAR(255);

-- 2. 이메일 인증 관련 필드 추가
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verification_expiry DATETIME;
ALTER TABLE users MODIFY COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- 3. auction 테이블에 user_id 컬럼 추가
ALTER TABLE auction ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1;

-- 4. 인덱스 추가
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_auction_user_id ON auction(user_id);

-- 5. 기존 데이터 보호
UPDATE users SET name = nickname WHERE name IS NULL;
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
UPDATE auction SET user_id = 1 WHERE user_id IS NULL;

-- 6. 테이블 구조 확인
DESCRIBE users;
DESCRIBE auction; 