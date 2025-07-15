-- 좋아요 테이블 생성 (auction 테이블 참조)
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_auction (user_id, auction_id),
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE
);

-- 인덱스 추가
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_auction_id ON favorites(auction_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at); 