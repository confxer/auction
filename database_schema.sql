-- =====================================================
-- 🎁 AUCTION SYSTEM DATABASE SCHEMA
-- =====================================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS auctiondb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auctiondb;

-- =====================================================
-- 📋 경매 테이블 (auction)
-- =====================================================
CREATE TABLE IF NOT EXISTS auction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '경매 제목',
    category VARCHAR(50) NOT NULL COMMENT '카테고리',
    status VARCHAR(20) NOT NULL DEFAULT '신품' COMMENT '상품 상태 (신품/중고)',
    brand VARCHAR(100) COMMENT '브랜드',
    image_url1 VARCHAR(500) COMMENT '이미지 URL 1',
    image_url2 VARCHAR(500) COMMENT '이미지 URL 2',
    image_url3 VARCHAR(500) COMMENT '이미지 URL 3',
    description TEXT COMMENT '상품 설명',
    start_price INT NOT NULL COMMENT '시작가',
    buy_now_price INT COMMENT '즉시구매가',
    bid_unit INT NOT NULL DEFAULT 1000 COMMENT '입찰단위',
    start_time DATETIME NOT NULL COMMENT '시작시간',
    end_time DATETIME NOT NULL COMMENT '종료시간',
    min_bid_count INT NOT NULL DEFAULT 1 COMMENT '최소 입찰 수',
    auto_extend BOOLEAN NOT NULL DEFAULT FALSE COMMENT '자동 연장 여부',
    shipping_fee VARCHAR(20) NOT NULL DEFAULT '무료' COMMENT '배송비',
    shipping_type VARCHAR(20) NOT NULL DEFAULT '택배' COMMENT '배송 방법',
    location VARCHAR(200) COMMENT '거래지역',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    highest_bid INT NOT NULL DEFAULT 0 COMMENT '최고 입찰가',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE COMMENT '경매 종료 여부',
    winner VARCHAR(100) COMMENT '낙찰자'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='경매 정보';

-- =====================================================
-- 💰 입찰 테이블 (bids)
-- =====================================================
CREATE TABLE IF NOT EXISTS bids (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL COMMENT '경매 ID',
    bidder VARCHAR(100) NOT NULL COMMENT '입찰자',
    bid_amount INT NOT NULL COMMENT '입찰 금액',
    bid_time DATETIME NOT NULL COMMENT '입찰 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_bid_time (bid_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='입찰 내역';

-- =====================================================
-- 👤 사용자 테이블 (users) - 향후 인증 시스템용
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자명',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    nickname VARCHAR(50) COMMENT '닉네임',
    phone VARCHAR(20) COMMENT '전화번호',
    address TEXT COMMENT '주소',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '권한 (USER/ADMIN)',
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보';

-- =====================================================
-- 💬 댓글 테이블 (comments) - 향후 댓글 기능용
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL COMMENT '경매 ID',
    user_id BIGINT COMMENT '사용자 ID (향후 인증 시스템 연동)',
    author VARCHAR(100) NOT NULL COMMENT '작성자',
    content TEXT NOT NULL COMMENT '댓글 내용',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='경매 댓글';

-- =====================================================
-- 🔔 알림 테이블 (notifications) - 향후 알림 기능용
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '사용자 ID (향후 인증 시스템 연동)',
    auction_id BIGINT COMMENT '경매 ID',
    type VARCHAR(50) NOT NULL COMMENT '알림 타입',
    title VARCHAR(200) NOT NULL COMMENT '알림 제목',
    message TEXT NOT NULL COMMENT '알림 내용',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '읽음 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='알림';

-- =====================================================
-- 📊 통계 테이블 (statistics) - 향후 통계 기능용
-- =====================================================
CREATE TABLE IF NOT EXISTS statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL COMMENT '경매 ID',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    bid_count INT NOT NULL DEFAULT 0 COMMENT '입찰 수',
    unique_bidders INT NOT NULL DEFAULT 0 COMMENT '고유 입찰자 수',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    UNIQUE KEY unique_auction_stat (auction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='경매 통계';

-- =====================================================
-- 🎯 샘플 데이터 삽입
-- =====================================================

-- 샘플 경매 데이터
INSERT INTO auction (
    title, category, status, brand, description, 
    start_price, buy_now_price, bid_unit, 
    start_time, end_time, min_bid_count, 
    shipping_fee, shipping_type, location
) VALUES 
('iPhone 15 Pro 256GB', '전자제품', '신품', 'Apple', '애플 아이폰 15 Pro 256GB 네이처 티타늄 색상입니다. 미개봉 새제품입니다.', 
 1200000, 1500000, 50000, 
 '2024-01-15 10:00:00', '2024-01-20 18:00:00', 1, 
 '무료', '택배', '서울시 강남구'),

('Nike Air Jordan 1 Retro High OG', '패션', '신품', 'Nike', '나이키 에어 조던 1 레트로 하이 OG 시카고 컬러웨이입니다. 사이즈 270입니다.', 
 200000, 350000, 10000, 
 '2024-01-16 09:00:00', '2024-01-22 20:00:00', 1, 
 '착불', '택배', '부산시 해운대구'),

('삼성 65인치 QLED 4K TV', '가전', '중고', 'Samsung', '삼성 65인치 QLED 4K 스마트 TV입니다. 2년 사용했지만 상태 좋습니다.', 
 800000, 1200000, 50000, 
 '2024-01-14 14:00:00', '2024-01-19 22:00:00', 1, 
 '선불', '택배', '대구시 수성구'),

('로렉스 서브마리너', '명품', '중고', 'Rolex', '로렉스 서브마리너 데이트 저스트 41mm입니다. 5년 사용했지만 정품입니다.', 
 8000000, 12000000, 500000, 
 '2024-01-17 11:00:00', '2024-01-25 18:00:00', 1, 
 '무료', '직거래', '서울시 강남구'),

('PlayStation 5 디지털 에디션', '전자제품', '신품', 'Sony', '소니 플레이스테이션 5 디지털 에디션입니다. 미개봉 새제품입니다.', 
 400000, 550000, 20000, 
 '2024-01-18 10:00:00', '2024-01-23 20:00:00', 1, 
 '무료', '택배', '인천시 연수구'),

('샤넬 클래식 플랩백', '명품', '신품', 'Chanel', '샤넬 클래식 플랩백 미디움 사이즈입니다. 블랙 컬러입니다.', 
 5000000, 7000000, 200000, 
 '2024-01-19 09:00:00', '2024-01-26 18:00:00', 1, 
 '무료', '직거래', '서울시 강남구'),

('LG 그램 15인치 노트북', '전자제품', '중고', 'LG', 'LG 그램 15인치 노트북입니다. 1년 사용했지만 상태 좋습니다.', 
 600000, 900000, 30000, 
 '2024-01-20 14:00:00', '2024-01-27 22:00:00', 1, 
 '착불', '택배', '광주시 서구'),

('아디다스 울트라부스트', '패션', '신품', 'Adidas', '아디다스 울트라부스트 22 DNA입니다. 사이즈 280입니다.', 
 150000, 250000, 10000, 
 '2024-01-21 10:00:00', '2024-01-28 20:00:00', 1, 
 '무료', '택배', '대전시 유성구');

-- 샘플 입찰 데이터
INSERT INTO bids (auction_id, bidder, bid_amount, bid_time) VALUES 
(1, '김철수', 1250000, '2024-01-15 14:30:00'),
(1, '이영희', 1300000, '2024-01-16 09:15:00'),
(1, '박민수', 1350000, '2024-01-17 16:45:00'),
(2, '최지영', 210000, '2024-01-16 10:20:00'),
(2, '정수민', 220000, '2024-01-17 11:30:00'),
(3, '강동원', 850000, '2024-01-15 15:00:00'),
(4, '윤서연', 8500000, '2024-01-18 13:20:00'),
(5, '임태현', 420000, '2024-01-19 14:10:00'),
(6, '한소희', 5200000, '2024-01-20 10:30:00'),
(7, '송중기', 630000, '2024-01-21 16:20:00'),
(8, '김태희', 160000, '2024-01-22 11:45:00');

-- 최고가 업데이트
UPDATE auction a SET 
    highest_bid = (
        SELECT COALESCE(MAX(bid_amount), 0) 
        FROM bids b 
        WHERE b.auction_id = a.id
    );

-- 샘플 댓글 데이터
INSERT INTO comments (auction_id, user_id, author, content, created_at, updated_at, is_deleted) VALUES 
(1, NULL, '김철수', '정말 좋은 아이폰이네요! 상태는 어떤가요?', '2024-01-15 15:30:00', '2024-01-15 15:30:00', FALSE),
(1, NULL, '이영희', '네이처 티타늄 색상이 정말 예쁘네요. 입찰해보겠습니다!', '2024-01-16 10:15:00', '2024-01-16 10:15:00', FALSE),
(1, NULL, '박민수', '배터리 상태는 어떤가요? 사용 기간이 궁금합니다.', '2024-01-17 14:20:00', '2024-01-17 14:20:00', FALSE),
(2, NULL, '최지영', '사이즈 270 맞나요? 발볼이 넓은데 괜찮을까요?', '2024-01-16 11:30:00', '2024-01-16 11:30:00', FALSE),
(2, NULL, '정수민', '시카고 컬러웨이 정말 예쁘네요! 입찰하겠습니다.', '2024-01-17 09:45:00', '2024-01-17 09:45:00', FALSE),
(3, NULL, '강동원', '2년 사용했다고 하셨는데 화질은 어떤가요?', '2024-01-15 16:00:00', '2024-01-15 16:00:00', FALSE),
(3, NULL, '윤서연', 'QLED 화질이 정말 좋다고 하던데, 기대됩니다!', '2024-01-16 13:20:00', '2024-01-16 13:20:00', FALSE),
(4, NULL, '임태현', '정품 보증서 있나요? A/S는 어떻게 되나요?', '2024-01-18 12:10:00', '2024-01-18 12:10:00', FALSE),
(5, NULL, '한소희', 'PS5 디지털 에디션이라 게임을 따로 사야 하는군요.', '2024-01-19 15:30:00', '2024-01-19 15:30:00', FALSE),
(6, NULL, '송중기', '샤넬 클래식 플랩백 정말 예쁘네요! 블랙 컬러가 고급스럽습니다.', '2024-01-20 11:20:00', '2024-01-20 11:20:00', FALSE),
(7, NULL, '김태희', 'LG 그램이 정말 가벼운 노트북이라고 하던데, 배터리 수명은 어떤가요?', '2024-01-21 14:15:00', '2024-01-21 14:15:00', FALSE),
(8, NULL, '이민호', '아디다스 울트라부스트 정말 편하다고 하던데! 사이즈 280 맞나요?', '2024-01-22 10:30:00', '2024-01-22 10:30:00', FALSE);

-- =====================================================
-- 🔍 인덱스 최적화
-- =====================================================

-- 경매 테이블 인덱스
CREATE INDEX idx_auction_category ON auction(category);
CREATE INDEX idx_auction_status ON auction(status);
CREATE INDEX idx_auction_brand ON auction(brand);
CREATE INDEX idx_auction_start_time ON auction(start_time);
CREATE INDEX idx_auction_end_time ON auction(end_time);
CREATE INDEX idx_auction_is_closed ON auction(is_closed);
CREATE INDEX idx_auction_created_at ON auction(created_at);

-- 입찰 테이블 인덱스
CREATE INDEX idx_bids_bidder ON bids(bidder);
CREATE INDEX idx_bids_bid_amount ON bids(bid_amount);

-- =====================================================
-- 📋 뷰 생성 (자주 사용되는 쿼리)
-- =====================================================

-- 활성 경매 목록 뷰
CREATE VIEW active_auctions AS
SELECT 
    a.*,
    COUNT(b.id) as bid_count,
    COUNT(DISTINCT b.bidder) as unique_bidders
FROM auction a
LEFT JOIN bids b ON a.id = b.auction_id
WHERE a.is_closed = FALSE AND a.end_time > NOW()
GROUP BY a.id
ORDER BY a.created_at DESC;

-- 경매 통계 뷰
CREATE VIEW auction_stats AS
SELECT 
    a.id,
    a.title,
    a.category,
    a.start_price,
    a.highest_bid,
    a.buy_now_price,
    COUNT(b.id) as total_bids,
    COUNT(DISTINCT b.bidder) as unique_bidders,
    MAX(b.bid_amount) as max_bid,
    MIN(b.bid_amount) as min_bid,
    AVG(b.bid_amount) as avg_bid
FROM auction a
LEFT JOIN bids b ON a.id = b.auction_id
GROUP BY a.id;

-- =====================================================
-- 🔧 트리거 생성
-- =====================================================

-- 입찰 시 최고가 자동 업데이트 트리거
DELIMITER //
CREATE TRIGGER update_highest_bid_after_insert
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    UPDATE auction 
    SET highest_bid = (
        SELECT MAX(bid_amount) 
        FROM bids 
        WHERE auction_id = NEW.auction_id
    )
    WHERE id = NEW.auction_id;
END//
DELIMITER ;

-- =====================================================
-- ✅ 완료 메시지
-- =====================================================
SELECT '🎉 Auction Database Schema Created Successfully!' as message;
SELECT COUNT(*) as total_auctions FROM auction;
SELECT COUNT(*) as total_bids FROM bids; 

-- User 테이블 업데이트 (이메일 인증, Refresh Token, 로그인 이력 추가)
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN email_verification_expiry DATETIME,
ADD COLUMN refresh_token TEXT,
ADD COLUMN refresh_token_expiry DATETIME,
ADD COLUMN last_login_at DATETIME,
ADD COLUMN last_login_ip VARCHAR(45);

-- 로그인 이력 테이블
CREATE TABLE login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    login_at DATETIME NOT NULL,
    login_ip VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    failure_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 추가
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_at ON login_history(login_at);
CREATE INDEX idx_login_history_status ON login_history(status);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_refresh_token ON users(refresh_token); 