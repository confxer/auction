-- Auction 테이블에 userId 컬럼 추가
ALTER TABLE auction ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1;

-- 기존 경매 데이터에 기본 사용자 ID 설정 (필요시 실제 사용자 ID로 변경)
UPDATE auction SET user_id = 1 WHERE user_id IS NULL;

-- 외래키 제약조건 추가 (선택사항)
-- ALTER TABLE auction ADD CONSTRAINT fk_auction_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_auction_user_id ON auction(user_id); 