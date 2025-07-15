-- 샘플 사용자 데이터 삽입
USE auctiondb;

-- 기존 사용자 데이터 삭제 (선택사항)
-- DELETE FROM user;

-- 샘플 사용자 데이터 삽입 (BCrypt로 암호화된 비밀번호)
-- 비밀번호: 1234 (BCrypt 해시)
INSERT INTO user (username, email, password, role, email_verified, created_at, last_login, last_login_ip) VALUES
('user1', 'user1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'USER', 1, NOW(), NULL, NULL),
('user2', 'user2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'USER', 1, NOW(), NULL, NULL),
('admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'ADMIN', 1, NOW(), NULL, NULL),
('testuser', 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'USER', 1, NOW(), NULL, NULL);

-- 샘플 경매 데이터 삽입 (현재 스키마에 맞게 수정)
-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM auction;

-- 샘플 경매 데이터 삽입 (현재 스키마에 맞게)
INSERT INTO auction (title, category, status, brand, description, start_price, buy_now_price, bid_unit, start_time, end_time, min_bid_count, auto_extend, shipping_fee, shipping_type, location, highest_bid) VALUES
('애플 맥북 프로 16인치 M2 Pro', '전자제품', '신품', 'Apple', '최신 애플 맥북 프로 16인치 M2 Pro 칩 탑재 모델입니다. 32GB RAM, 1TB SSD, 스페이스 그레이 컬러입니다.', 2000000, 2800000, 50000, '2024-01-10 10:00:00', '2024-01-15 18:00:00', 1, 0, '무료', '택배', '서울시 강남구', 2500000),
('샤넬 클래식 플랩백 미니', '명품', '신품', 'Chanel', '샤넬 클래식 플랩백 미니 사이즈입니다. 블랙 캐비어 가죽, 골드 하드웨어, 완벽한 상태입니다.', 800000, 1200000, 20000, '2024-01-09 14:00:00', '2024-01-14 20:00:00', 1, 0, '무료', '직거래', '서울시 강남구', 850000),
('삼성 갤럭시 S24 울트라 256GB', '전자제품', '신품', 'Samsung', '삼성 갤럭시 S24 울트라 256GB 모델입니다. 타이타니움 그레이, 완전 새제품, 보증서 포함입니다.', 1100000, 1500000, 30000, '2024-01-11 09:00:00', '2024-01-16 22:00:00', 1, 0, '무료', '택배', '서울시 서초구', 1200000),
('로렉스 서브마리너 데이트', '명품', '중고', 'Rolex', '로렉스 서브마리너 데이트 41mm 모델입니다. 블랙 다이얼, 오이스터 브레이슬릿, 정품 보증서 포함입니다.', 8000000, 12000000, 500000, '2024-01-08 12:00:00', '2024-01-13 16:00:00', 1, 0, '무료', '직거래', '서울시 강남구', 8500000),
('닌텐도 스위치 OLED + 게임팩', '게임', '신품', 'Nintendo', '닌텐도 스위치 OLED 모델과 인기 게임팩 3개가 포함된 세트입니다. 화이트 컬러, 완전 새제품입니다.', 320000, 450000, 10000, '2024-01-12 15:00:00', '2024-01-17 19:00:00', 1, 0, '무료', '택배', '서울시 마포구', 350000),
('아디다스 울트라부스트 21', '패션', '신품', 'Adidas', '아디다스 울트라부스트 21 신발입니다. 사이즈 270, 블랙 컬러, 착용감이 뛰어난 프리미엄 러닝화입니다.', 160000, 250000, 10000, '2024-01-10 11:00:00', '2024-01-15 21:00:00', 1, 0, '무료', '택배', '서울시 강남구', 180000);

-- 데이터 확인
SELECT id, title, category, status, brand, start_price, buy_now_price, highest_bid, start_time, end_time FROM auction ORDER BY id DESC LIMIT 10; 