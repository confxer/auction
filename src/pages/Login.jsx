import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import { useUser } from "../UserContext";
import axios from "../axiosConfig";

const Login = () => {
  const [form, setForm] = useState({ 
    usernameOrEmail: "", 
    password: "" 
  });
  const [userType, setUserType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError(); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailVerificationRequired(false);

    try {
      console.log("로그인 시도:", { username: form.usernameOrEmail, password: form.password });
      
      const result = await login({
        username: form.usernameOrEmail,
        password: form.password,
      });

      if (result.success) {
        console.log("로그인 성공:", result.data);
        
        if (result.data.user && result.data.user.role === "ADMIN") {
          navigate("/notice/admin");
        } else {
          navigate("/");
        }
      } else {
        console.error("로그인 실패:", result.error);
        
        // 이메일 인증이 필요한 경우
        if (result.error && result.error.includes("이메일 인증이 필요합니다")) {
          setEmailVerificationRequired(true);
          // 이메일 주소 추출 (간단한 방법)
          const emailMatch = result.error.match(/발송된 이메일을 확인해주세요\./);
          if (emailMatch) {
            // 실제로는 서버에서 이메일을 받아와야 함
            setVerificationEmail(form.usernameOrEmail.includes('@') ? form.usernameOrEmail : '');
          }
        }
      }

    } catch (err) {
      console.error("로그인 요청 실패:", err);
      
      // 서버 응답에서 이메일 인증 필요 여부 확인
      if (err.response?.status === 403 && err.response?.data?.emailVerificationRequired) {
        setEmailVerificationRequired(true);
        setVerificationEmail(err.response.data.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await axios.post('/api/auth/verify-email', {
        token: verificationCode
      });

      if (response.data.success) {
        setVerificationSuccess(true);
        alert("이메일 인증이 완료되었습니다. 다시 로그인해주세요.");
        setEmailVerificationRequired(false);
        setVerificationCode("");
        setForm({ usernameOrEmail: "", password: "" });
      } else {
        alert(response.data.message || "인증에 실패했습니다.");
      }
    } catch (err) {
      console.error('이메일 인증 오류:', err);
      alert(err.response?.data?.message || "인증에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!verificationEmail) {
      alert("이메일 주소가 없습니다.");
      return;
    }

    try {
      const response = await axios.post('/api/auth/resend-verification', {
        email: verificationEmail
      });

      if (response.data.success) {
        alert("인증 메일이 재발송되었습니다.");
      } else {
        alert(response.data.message || "인증 메일 재발송에 실패했습니다.");
      }
    } catch (err) {
      console.error('인증 메일 재발송 오류:', err);
      alert(err.response?.data?.message || "인증 메일 재발송에 실패했습니다.");
    }
  };

  const handleSocial = (provider) => {
    if (userType === "admin") {
      setError("관리자는 소셜 로그인을 사용할 수 없습니다.");
      return;
    }
    setError(`${provider} 로그인은 준비 중입니다.`);
  };

  const handleQuickLogin = (type, credentials) => {
    setUserType(type);
    setForm({
      usernameOrEmail: credentials.username,
      password: credentials.password
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-background">
          <div className="background-content">
            <h1>경매 플랫폼에 오신 것을 환영합니다</h1>
            <p>안전하고 투명한 경매 서비스로 특별한 물품을 만나보세요</p>
            <div className="background-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>안전한 거래</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>실시간 입찰</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span>합리적인 가격</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-container" style={{ width: '100%', maxWidth: 400, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div className="login-header">
            <h2>로그인</h2>
            <p>아이디와 비밀번호를 입력해 주세요.</p>
          </div>

          {emailVerificationRequired ? (
            <div className="email-verification-section">
              <div className="verification-info">
                <div className="verification-icon">📧</div>
                <h3>이메일 인증 필요</h3>
                <p>
                  <strong>{verificationEmail}</strong>로 인증 메일을 발송했습니다.
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
                  style={{ flex: 1, marginRight: 10 }}
                >
                  {isVerifying ? '인증 중...' : '인증 완료'}
                </button>
                
                <button
                  type="button"
                  onClick={resendVerification}
                  className="btn btn-secondary"
                  style={{ flex: 1, marginLeft: 10 }}
                >
                  재발송
                </button>
              </div>

              <button
                type="button"
                onClick={() => setEmailVerificationRequired(false)}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 15 }}
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <div className="user-type-selector" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`user-type-btn ${userType === "user" ? "active" : ""}`}
                  onClick={() => setUserType("user")}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', background: userType === "user" ? '#007bff' : '#fff', color: userType === "user" ? '#fff' : '#333', borderRadius: '8px 0 0 8px', cursor: 'pointer' }}
                >
                  일반 사용자
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${userType === "admin" ? "active" : ""}`}
                  onClick={() => setUserType("admin")}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderLeft: 'none', background: userType === "admin" ? '#007bff' : '#fff', color: userType === "admin" ? '#fff' : '#333', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}
                >
                  관리자
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                  <label htmlFor="usernameOrEmail">아이디</label>
                  <input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    value={form.usernameOrEmail}
                    onChange={handleChange}
                    placeholder="아이디를 입력하세요"
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">비밀번호</label>
                  <div className="password-input" style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="비밀번호를 입력하세요"
                      required
                      style={{ width: '100%', padding: '12px', paddingRight: '50px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                  style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </button>
              </form>

              {error && (
                <div className="error-message" style={{ marginTop: '16px', padding: '12px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '8px', fontSize: '14px' }}>
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="auth-links" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  계정이 없으신가요?{" "}
                  <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>
                    회원가입
                  </Link>
                </p>
              </div>

              {userType === "user" && (
                <div className="social-login">
                  <div className="divider" style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
                    <span style={{ background: '#fff', padding: '0 10px', color: '#666', fontSize: '14px' }}>또는</span>
                    <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, border: 'none', borderTop: '1px solid #ddd', zIndex: -1 }} />
                  </div>
                  <div className="social-buttons" style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleSocial("kakao")}
                      className="social-btn kakao"
                      style={{ flex: 1, padding: '12px', border: '1px solid #fdd835', background: '#fdd835', color: '#000', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                      <span className="social-icon">💛</span>
                      카카오
                    </button>
                    <button
                      onClick={() => handleSocial("naver")}
                      className="social-btn naver"
                      style={{ flex: 1, padding: '12px', border: '1px solid #03c75a', background: '#03c75a', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                      <span className="social-icon">💚</span>
                      네이버
                    </button>
                    <button
                      onClick={() => handleSocial("google")}
                      className="social-btn google"
                      style={{ flex: 1, padding: '12px', border: '1px solid #4285f4', background: '#4285f4', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    >
                      <span className="social-icon">🔍</span>
                      구글
                    </button>
                  </div>
                </div>
              )}

              {userType === "admin" && (
                <div className="quick-login" style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>빠른 로그인 (개발용)</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleQuickLogin("admin", { username: "admin", password: "admin123" })}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', background: '#f8f9fa', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      관리자
                    </button>
                    <button
                      onClick={() => handleQuickLogin("user", { username: "user", password: "user123" })}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', background: '#f8f9fa', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      일반 사용자
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
