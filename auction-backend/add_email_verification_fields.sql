-- 이메일 인증 관련 필드 추가
ALTER TABLE user ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE user ADD COLUMN email_verification_expiry DATETIME;
ALTER TABLE user MODIFY COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- 인덱스 추가
CREATE INDEX idx_user_email_verification_token ON user(email_verification_token);
CREATE INDEX idx_user_email_verified ON user(email_verified);

-- 기존 사용자들의 이메일 인증 상태를 TRUE로 설정 (기존 사용자 보호)
UPDATE user SET email_verified = TRUE WHERE email_verified IS NULL; 