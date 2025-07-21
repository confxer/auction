-- User 테이블에 name 컬럼 추가
ALTER TABLE user ADD COLUMN name VARCHAR(255);

-- 기존 사용자들의 name을 nickname으로 설정 (기존 사용자 보호)
UPDATE user SET name = nickname WHERE name IS NULL; 