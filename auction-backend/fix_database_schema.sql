-- 기존 테이블 구조 수정 스크립트
-- MariaDB에서 실행

USE auctiondb;

-- status 필드 길이 확장
ALTER TABLE auction MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';

-- image_url 필드들 길이 확장
ALTER TABLE auction MODIFY COLUMN image_url1 VARCHAR(500);
ALTER TABLE auction MODIFY COLUMN image_url2 VARCHAR(500);
ALTER TABLE auction MODIFY COLUMN image_url3 VARCHAR(500);

-- shipping_fee, shipping_type 기본값 제거 (한글 기본값 문제)
ALTER TABLE auction MODIFY COLUMN shipping_fee VARCHAR(100);
ALTER TABLE auction MODIFY COLUMN shipping_type VARCHAR(50);

-- location 필드 길이 확장
ALTER TABLE auction MODIFY COLUMN location VARCHAR(200);

-- min_bid_count 기본값 설정
ALTER TABLE auction MODIFY COLUMN min_bid_count INT NOT NULL DEFAULT 1;

-- auto_extend 기본값 설정
ALTER TABLE auction MODIFY COLUMN auto_extend BOOLEAN NOT NULL DEFAULT FALSE;

-- highest_bid 기본값 설정
ALTER TABLE auction MODIFY COLUMN highest_bid INT NOT NULL DEFAULT 0;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_status ON auction(status);
CREATE INDEX IF NOT EXISTS idx_category ON auction(category);
CREATE INDEX IF NOT EXISTS idx_end_time ON auction(end_time);

-- 수정된 테이블 구조 확인
DESC auction; 