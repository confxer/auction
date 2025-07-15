-- testuser가 찜한 경매 샘플 데이터 삽입
USE auctiondb;

-- testuser의 ID 확인 (보통 2번이 testuser)
-- SELECT id, username, nickname FROM user WHERE username = 'testuser';

-- favorites 테이블에 testuser가 찜한 경매 데이터 추가
INSERT INTO favorites (user_id, auction_id, created_at) VALUES
(2, 1, NOW()), -- 애플 맥북 프로 찜하기
(2, 3, NOW()), -- 삼성 갤럭시 S24 울트라 찜하기
(2, 5, NOW()); -- 닌텐도 스위치 OLED 찜하기

-- 데이터 확인
SELECT 
    f.id,
    f.user_id,
    f.auction_id,
    u.username,
    a.title,
    a.category,
    a.start_price,
    a.highest_bid,
    a.end_time,
    f.created_at
FROM favorites f
JOIN user u ON f.user_id = u.id
JOIN auction a ON f.auction_id = a.id
WHERE u.username = 'testuser'
ORDER BY f.created_at DESC; 