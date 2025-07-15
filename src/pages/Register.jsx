import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import "../style/Register.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    nickname: "",
    address: "",
    socialType: "NONE",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { register } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // 입력 시 에러 메시지 제거
  };

  const validateStep1 = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("모든 필수 항목을 입력해주세요.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (form.password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return false;
    }
    if (!form.email.includes('@')) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.name) {
      setError("이름을 입력해주세요.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError("");
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 중복 제출 방지
    if (isLoading) {
      return;
    }
    
    setError("");
    setSuccess(false);
    setIsLoading(true);

    if (!validateStep2()) {
      setIsLoading(false);
      return;
    }

    try {
      // UserContext의 register 함수 사용
      const result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        nickname: form.nickname,
        address: form.address,
        socialType: form.socialType
      });
      
      if (result.success) {
        setSuccess(true);
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    setError(`${provider} 회원가입은 준비 중입니다.`);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* 왼쪽 배경 */}
        <div className="register-background">
          <div className="background-content">
            <h1>경매 플랫폼에<br />가입하세요</h1>
            <p>안전하고 투명한 경매 서비스로<br />특별한 경험을 시작하세요</p>
            <div className="background-features">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>간편한 가입</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>안전한 보안</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>빠른 시작</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 회원가입 폼 */}
        <div className="register-form-container">
          <div className="register-header">
            <h2>회원가입</h2>
            <p>계정을 생성하여 경매에 참여하세요</p>
          </div>

          {success ? (
            <div className="success-message">
              <div className="success-icon">🎉</div>
              <h3>회원가입 성공!</h3>
              <p>로그인 페이지로 이동합니다...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              {/* 진행 단계 표시 */}
              <div className="step-indicator">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                  <span className="step-number">1</span>
                  <span className="step-label">기본 정보</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-label">추가 정보</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="register-form">
                {currentStep === 1 ? (
                  <div className="step-content">
                    <div className="input-group">
                      <label htmlFor="username">아이디 *</label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="아이디를 입력하세요"
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="email">이메일 *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="이메일을 입력하세요"
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="password">비밀번호 *</label>
                      <div className="password-input">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          placeholder="비밀번호를 입력하세요 (4자 이상)"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                      <div className="password-input">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="비밀번호를 다시 입력하세요"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary"
                    >
                      다음 단계
                    </button>
                  </div>
                ) : (
                  <div className="step-content">
                    <div className="input-group">
                      <label htmlFor="name">이름 *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="nickname">닉네임</label>
                      <input
                        id="nickname"
                        name="nickname"
                        type="text"
                        value={form.nickname}
                        onChange={handleChange}
                        placeholder="닉네임을 입력하세요"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="phone">전화번호</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="전화번호를 입력하세요"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="address">주소</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="주소를 입력하세요"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                      >
                        이전 단계
                      </button>
                      <button
                        type="submit"
                        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="loading-spinner"></span>
                            가입 중...
                          </>
                        ) : (
                          '회원가입 완료'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* 에러 메시지 */}
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {/* 로그인 링크 */}
              <div className="auth-links">
                <p>
                  이미 계정이 있으신가요?{" "}
                  {/* <Link to="/login" className="login-link"> */}
                    로그인
                  {/* </Link> */}
                </p>
              </div>

              {/* 소셜 회원가입 */}
              <div className="social-register">
                <div className="divider">
                  <span>또는</span>
                </div>
                <div className="social-buttons">
                  <button
                    onClick={() => handleSocialRegister("kakao")}
                    className="social-btn kakao"
                  >
                    <span className="social-icon">💛</span>
                    카카오로 가입
                  </button>
                  <button
                    onClick={() => handleSocialRegister("naver")}
                    className="social-btn naver"
                  >
                    <span className="social-icon">💚</span>
                    네이버로 가입
                  </button>
                  <button
                    onClick={() => handleSocialRegister("google")}
                    className="social-btn google"
                  >
                    <span className="social-icon">🔍</span>
                    구글로 가입
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register; 