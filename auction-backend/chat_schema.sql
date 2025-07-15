-- 실시간 채팅 및 쪽지 시스템 스키마
-- MariaDB에서 실행

USE auctiondb;

-- =====================================================
-- 💬 채팅방 테이블 (chat_rooms)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL COMMENT '경매 ID',
    room_name VARCHAR(200) NOT NULL COMMENT '채팅방 이름',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅방';

-- =====================================================
-- 💬 채팅 메시지 테이블 (chat_messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL COMMENT '채팅방 ID',
    sender_id VARCHAR(100) NOT NULL COMMENT '발신자 ID',
    sender_name VARCHAR(100) NOT NULL COMMENT '발신자 이름',
    message TEXT NOT NULL COMMENT '메시지 내용',
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' COMMENT '메시지 타입 (TEXT/IMAGE/SYSTEM)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발송일',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅 메시지';

-- =====================================================
-- 📝 쪽지 테이블 (private_messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS private_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL COMMENT '경매 ID',
    sender_id VARCHAR(100) NOT NULL COMMENT '발신자 ID',
    sender_name VARCHAR(100) NOT NULL COMMENT '발신자 이름',
    receiver_id VARCHAR(100) NOT NULL COMMENT '수신자 ID',
    receiver_name VARCHAR(100) NOT NULL COMMENT '수신자 이름',
    subject VARCHAR(200) NOT NULL COMMENT '쪽지 제목',
    content TEXT NOT NULL COMMENT '쪽지 내용',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '읽음 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발송일',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    INDEX idx_auction_id (auction_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='쪽지';

-- =====================================================
-- 👥 채팅방 참여자 테이블 (chat_participants)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL COMMENT '채팅방 ID',
    user_id VARCHAR(100) NOT NULL COMMENT '사용자 ID',
    user_name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참여일',
    last_read_at DATETIME COMMENT '마지막 읽은 시간',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_user (room_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅방 참여자';

-- =====================================================
-- 🎯 샘플 데이터 삽입
-- =====================================================

-- 채팅방 생성 (기존 경매에 대해)
INSERT INTO chat_rooms (auction_id, room_name) VALUES 
(1, 'iPhone 15 Pro 경매 채팅방'),
(2, 'Nike Air Jordan 1 경매 채팅방'),
(3, '샤넬 클래식 플랩백 경매 채팅방');

-- 채팅방 참여자 추가
INSERT INTO chat_participants (room_id, user_id, user_name) VALUES 
(1, 'seller', '판매자'),
(1, 'user1', '김철수'),
(1, 'user2', '이영희'),
(2, 'seller', '판매자'),
(2, 'user3', '박민수'),
(3, 'seller', '판매자'),
(3, 'user4', '최지영');

-- 샘플 채팅 메시지
INSERT INTO chat_messages (room_id, sender_id, sender_name, message, message_type) VALUES 
(1, 'seller', '판매자', '안녕하세요! iPhone 15 Pro 경매에 오신 것을 환영합니다!', 'TEXT'),
(1, 'user1', '김철수', '안녕하세요! 배터리 상태는 어떤가요?', 'TEXT'),
(1, 'seller', '판매자', '배터리 상태는 100%입니다. 미개봉 새제품이에요!', 'TEXT'),
(1, 'user2', '이영희', '배송은 언제 가능한가요?', 'TEXT'),
(1, 'seller', '판매자', '낙찰 후 1-2일 내에 배송 가능합니다.', 'TEXT'),
(2, 'seller', '판매자', 'Nike Air Jordan 1 경매 시작합니다!', 'TEXT'),
(2, 'user3', '박민수', '사이즈 270 맞나요?', 'TEXT'),
(3, 'seller', '판매자', '샤넬 클래식 플랩백 경매입니다!', 'TEXT');

-- 샘플 쪽지
INSERT INTO private_messages (auction_id, sender_id, sender_name, receiver_id, receiver_name, subject, content) VALUES 
(1, 'user1', '김철수', 'seller', '판매자', 'iPhone 15 Pro 문의', '안녕하세요! iPhone 15 Pro에 대해 몇 가지 문의드립니다.'),
(1, 'seller', '판매자', 'user1', '김철수', 'Re: iPhone 15 Pro 문의', '네, 어떤 점이 궁금하신가요?'),
(2, 'user3', '박민수', 'seller', '판매자', 'Nike 신발 사이즈 문의', '사이즈 270이 맞는지 확인 부탁드립니다.'),
(3, 'user4', '최지영', 'seller', '판매자', '샤넬 가방 상태 문의', '가방 상태가 어떤지 자세히 알려주세요.');

-- =====================================================
-- 🔍 인덱스 최적화
-- =====================================================

-- 채팅 메시지 인덱스
CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, created_at);

-- 쪽지 인덱스
CREATE INDEX idx_private_messages_receiver_read ON private_messages(receiver_id, is_read);
CREATE INDEX idx_private_messages_sender ON private_messages(sender_id, created_at);

-- =====================================================
-- ✅ 완료 메시지
-- =====================================================
SELECT '🎉 Chat System Database Schema Created Successfully!' as message;
SELECT COUNT(*) as total_chat_rooms FROM chat_rooms;
SELECT COUNT(*) as total_chat_messages FROM chat_messages;
SELECT COUNT(*) as total_private_messages FROM private_messages; 