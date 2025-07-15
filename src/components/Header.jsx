import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import "./Header.css";

const Header = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && keyword.trim()) {
      navigate(`/search?query=${encodeURIComponent(keyword)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate("/")}>
            🏆 경매 플랫폼
          </h1>
        </div>
        
        <div className="header-center">
          <input
            className="search-input"
            placeholder="상품, 브랜드, 경매 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <span className="username">안녕하세요, {user.username}님!</span>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={() => navigate("/login")}>
                로그인
              </button>
              <button className="register-btn" onClick={() => navigate("/register")}>
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 