import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "../axiosConfig";
import "../style/Register.css";
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isCaptchaSuccessful, setIsCaptchaSuccessful] = useState(false);
  const recaptchaRef = useRef();
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
    if (!isCaptchaSuccessful) {
      setError("reCAPTCHA를 완료해주세요.");
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
      // 회원가입 요청
      const response = await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        nickname: form.nickname,
        address: form.address,
        socialType: form.socialType
      });
      
      if (response.data.success) {
        setSuccess(true);
        setVerificationSent(true);
        setCurrentStep(3); // 이메일 인증 단계로 이동
      } else {
        setError(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const requestData = { token: verificationCode };
      console.log('🔍 인증 요청 데이터:', requestData);
      
      const response = await axios.post('/api/auth/verify-email', requestData);
      console.log('✅ 인증 응답:', response.data);

      if (response.data.success) {
        setVerificationSuccess(true);
        setError("");
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || "인증에 실패했습니다.");
      }
    } catch (err) {
      console.error('❌ 이메일 인증 오류:', err);
      console.error('📊 에러 상세:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.response?.data?.message
      });
      setError(err.response?.data?.message || "인증에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    try {
      const response = await axios.post('/api/auth/resend-verification', {
        email: form.email
      });

      if (response.data.success) {
        alert("인증 메일이 재발송되었습니다.");
      } else {
        setError(response.data.message || "인증 메일 재발송에 실패했습니다.");
      }
    } catch (err) {
      console.error('인증 메일 재발송 오류:', err);
      setError(err.response?.data?.message || "인증 메일 재발송에 실패했습니다.");
    }
  };

  const handleSocialRegister = (provider) => {
    setError(`${provider} 회원가입은 준비 중입니다.`);
  };

  function handleCaptchaChange(token) {
    console.log("reCAPTCHA token:", token);
    if (token) {
      setIsCaptchaSuccessful(true);
    }
  }

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

          {verificationSuccess ? (
            <div className="success-message">
              <div className="success-icon">🎉</div>
              <h3>이메일 인증 완료!</h3>
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
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-label">이메일 인증</span>
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
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LcgJIsrAAAAAOTBM3zn0dDZfOp6c5Rmm9BameYp"
                      onChange={handleCaptchaChange}
                    />
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary"
                      disabled={!isCaptchaSuccessful}
                    >
                      다음 단계
                    </button>
                  </div>
                ) : currentStep === 2 ? (
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
                ) : (
                  // 이메일 인증 단계
                  <div className="step-content">
                    <div className="verification-info">
                      <div className="verification-icon">📧</div>
                      <h3>이메일 인증</h3>
                      <p>
                        <strong>{form.email}</strong>로 인증 메일을 발송했습니다.
                      </p>
                      <p>메일함을 확인하여 인증을 완료해주세요.</p>
                    </div>

                    <div className="input-group">
                      <label htmlFor="verificationCode">인증 코드</label>
                      <input
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="이메일로 받은 인증 코드를 입력하세요"
                      />
                    </div>

                    <div className="verification-actions">
                      <button
                        type="button"
                        onClick={handleVerification}
                        className={`btn btn-primary ${isVerifying ? 'loading' : ''}`}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <span className="loading-spinner"></span>
                            인증 중...
                          </>
                        ) : (
                          '인증 완료'
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={resendVerification}
                        className="btn btn-secondary"
                      >
                        인증 메일 재발송
                      </button>
                    </div>

                    <div className="verification-help">
                      <p>인증 메일이 오지 않았나요?</p>
                      <ul>
                        <li>스팸 메일함을 확인해보세요</li>
                        <li>이메일 주소가 정확한지 확인해보세요</li>
                        <li>위의 "재발송" 버튼을 클릭해보세요</li>
                      </ul>
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
                  <Link to="/login" className="login-link">
                    로그인
                  </Link>
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