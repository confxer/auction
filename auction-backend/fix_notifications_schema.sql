-- notifications 테이블 user_id 필드 타입 수정
-- MariaDB에서 실행

USE auctiondb;

-- user_id 필드를 VARCHAR로 변경
ALTER TABLE notifications MODIFY COLUMN user_id VARCHAR(100) COMMENT '사용자 ID';

-- 수정된 테이블 구조 확인
DESCRIBE notifications; 