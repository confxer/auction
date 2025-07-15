-- 경매 데이터베이스 스키마
-- MariaDB용 테이블 생성 스크립트

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS auctiondb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auctiondb;

-- 경매 테이블
CREATE TABLE IF NOT EXISTS auction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_price BIGINT NOT NULL,
    buy_now_price BIGINT,
    current_price BIGINT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    image_url VARCHAR(500),
    image_base64 LONGTEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    owner_id BIGINT NOT NULL,
    INDEX idx_status (status),
    INDEX idx_end_at (end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 입찰 테이블
CREATE TABLE IF NOT EXISTS bids (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder VARCHAR(100) NOT NULL,
    bid_amount INT NOT NULL,
    bid_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_bid_time (bid_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS notice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'published',
    is_important BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    author VARCHAR(100) DEFAULT '관리자',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQ 테이블
CREATE TABLE IF NOT EXISTS faq (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'published',
    views INT DEFAULT 0,
    author VARCHAR(100) DEFAULT '관리자',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 이벤트 테이블
CREATE TABLE IF NOT EXISTS event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'published',
    start_date DATETIME,
    end_date DATETIME,
    image_url VARCHAR(500),
    views INT DEFAULT 0,
    author VARCHAR(100) DEFAULT '관리자',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 샘플 공지사항 데이터
INSERT INTO notice (title, content, category, status, is_important, views, author, created_at) VALUES
('2024년 몬스터옥션 이용약관 개정 안내', '안녕하세요. 2024년 1월 1일부터 몬스터옥션 이용약관이 개정됩니다. 주요 변경사항은 다음과 같습니다:\n\n1. 수수료 정책 변경\n2. 환불 정책 개선\n3. 개인정보 보호 강화\n\n자세한 내용은 이용약관을 참고해 주시기 바랍니다.', 'important', 'published', TRUE, 1250, '관리자', NOW()),
('신년 맞이 특별 이벤트 안내', '새해를 맞이하여 특별한 이벤트를 준비했습니다!\n\n- 신규 가입자 50% 할인 쿠폰\n- 첫 경매 등록 시 수수료 면제\n- 추천인 제도 도입\n\n많은 참여 부탁드립니다.', 'event', 'published', FALSE, 890, '관리자', NOW() - INTERVAL 1 DAY),
('시스템 점검 안내', '더 나은 서비스를 위해 시스템 점검을 실시합니다.\n\n점검 시간: 2024년 1월 15일 02:00 ~ 06:00\n점검 내용: 서버 성능 개선 및 보안 강화\n\n점검 중에는 서비스 이용이 제한될 수 있습니다.', 'maintenance', 'published', TRUE, 567, '관리자', NOW() - INTERVAL 2 DAY);

-- 샘플 FAQ 데이터
INSERT INTO faq (question, answer, category, status, views, author, created_at) VALUES
('경매에 참여하려면 어떻게 해야 하나요?', '경매에 참여하려면 먼저 회원가입을 하신 후, 원하는 경매 상품을 선택하여 입찰하시면 됩니다. 입찰은 현재가보다 높은 금액으로만 가능합니다.', 'auction', 'published', 234, '관리자', NOW()),
('경매 수수료는 얼마인가요?', '경매 수수료는 낙찰가의 5%입니다. 예를 들어 100만원에 낙찰되면 5만원의 수수료가 발생합니다.', 'payment', 'published', 189, '관리자', NOW()),
('입찰 취소가 가능한가요?', '입찰은 한 번 제출하면 취소할 수 없습니다. 신중하게 입찰해 주시기 바랍니다.', 'auction', 'published', 156, '관리자', NOW()),
('배송은 언제 되나요?', '낙찰 후 3일 이내에 결제가 완료되면, 판매자가 7일 이내에 배송을 시작합니다.', 'delivery', 'published', 123, '관리자', NOW()),
('환불이 가능한가요?', '상품에 하자가 있거나 설명과 다른 경우에만 환불이 가능합니다. 단순 변심으로는 환불이 불가능합니다.', 'refund', 'published', 98, '관리자', NOW());

-- 샘플 이벤트 데이터
INSERT INTO event (title, content, category, status, start_date, end_date, views, author, created_at) VALUES
('신규 가입자 환영 이벤트', '새로 가입하신 분들을 위한 특별한 혜택!\n\n- 첫 경매 등록 시 수수료 100% 면제\n- 10만원 상당의 입찰 쿠폰 지급\n- 30일간 프리미엄 서비스 무료 이용\n\n지금 바로 가입하고 혜택을 받아보세요!', 'promotion', 'published', NOW(), NOW() + INTERVAL 30 DAY, 456, '관리자', NOW()),
('겨울 시즌 특별 경매', '겨울 시즌을 맞이한 특별한 경매가 시작됩니다!\n\n- 겨울 스포츠 용품\n- 패션 아이템\n- 홈 데코 상품\n\n다양한 상품을 특가로 만나보세요.', 'seasonal', 'published', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, 234, '관리자', NOW() - INTERVAL 5 DAY),
('연말 감사제', '한 해 동안 함께해주신 고객님들께 감사드립니다.\n\n- 모든 경매 수수료 50% 할인\n- 특별 경매 상품 추가\n- 추첨을 통한 경품 이벤트\n\n많은 참여 부탁드립니다!', 'thanksgiving', 'published', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, 345, '관리자', NOW() - INTERVAL 10 DAY);

-- 테이블 생성 확인
SHOW TABLES;
DESCRIBE auction;
DESCRIBE bids;
DESCRIBE notice;
DESCRIBE faq;
DESCRIBE event; 