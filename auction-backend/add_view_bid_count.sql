-- auction 테이블에 viewCount와 bidCount 컬럼 추가
ALTER TABLE auction ADD COLUMN view_count INT NOT NULL DEFAULT 0;
ALTER TABLE auction ADD COLUMN bid_count INT NOT NULL DEFAULT 0;

-- 기존 데이터의 bid_count를 실제 입찰 수로 업데이트
UPDATE auction a 
SET bid_count = (
    SELECT COUNT(*) 
    FROM bid b 
    WHERE b.auction_id = a.id
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_auction_view_count ON auction(view_count);
CREATE INDEX idx_auction_bid_count ON auction(bid_count); 