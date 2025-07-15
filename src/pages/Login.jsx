import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import { useUser } from "../UserContext";

const Login = () => {
  const [form, setForm] = useState({ 
    usernameOrEmail: "", 
    password: "" 
  });
  const [userType, setUserType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError(); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      }

    } catch (err) {
      console.error("로그인 요청 실패:", err);
    } finally {
      setIsLoading(false);
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

          <div className="user-type-selector" style={{ marginBottom: 16 }}>
            <button
              className={`type-btn ${userType === "user" ? "active" : ""}`}
              onClick={() => setUserType("user")}
              type="button"
            >
              👤 일반 사용자
            </button>
            <button
              className={`type-btn ${userType === "admin" ? "active" : ""}`}
              onClick={() => setUserType("admin")}
              type="button"
            >
              🔧 관리자
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="usernameOrEmail">
                {userType === "admin" ? "관리자 아이디" : "아이디 또는 이메일"}
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder={userType === "admin" ? "관리자 아이디를 입력하세요" : "아이디 또는 이메일을 입력하세요"}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
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

            <button
              type="submit"
              className={`login-btn ${userType === "admin" ? "admin" : ""} ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
              style={{ marginTop: 16 }}
            >
              {isLoading ? "로그인 중..." : userType === "admin" ? "관리자 로그인" : "로그인"}
            </button>
          </form>

          {error && (
            <div className="error-message" style={{ marginTop: 12 }}>
              ⚠️ {error}
            </div>
          )}

          <div className="auth-links" style={{ marginTop: 16 }}>
            <p>
              계정이 없으신가요?{' '}
              <Link to="/register" className="register-link">회원가입</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
