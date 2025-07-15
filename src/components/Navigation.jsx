import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import './Navigation.css';
import { FaTrophy } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import { FaEnvelope } from 'react-icons/fa';
import { IoPersonCircle } from "react-icons/io5";
import { useState, useRef, useEffect } from 'react';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'ADMIN';

  // 드롭다운 상태 관리
  const [myPageOpen, setMyPageOpen] = useState(false);
  const myPageRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (myPageRef.current && !myPageRef.current.contains(event.target)) {
        setMyPageOpen(false);
      }
    }
    if (myPageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [myPageOpen]);

  // 마이페이지 드롭다운 토글 함수
  const toggleMyPage = () => {
    setMyPageOpen((prev) => !prev);
  };

  const navItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/auction', label: '경매', icon: '🔨' },
    { 
      path: isAdmin ? '/event/admin' : '/event', 
      label: '이벤트', 
      icon: '🎁' 
    },
    { 
      path: isAdmin ? '/notice/admin' : '/notice', 
      label: '공지사항', 
      icon: '📢' 
    },
    { 
      path: isAdmin ? '/faq/admin' : '/faq', 
      label: 'FAQ', 
      icon: '❓' 
    },
    { 
      path: isAdmin ? '/inquiry/admin' : (user ? '/inquiry/my' : '/inquiry'), 
      label: '1:1문의', 
      icon: '💬' 
    },
    { path: '/customer-service', label: '고객센터', icon: '📞' }
  ];

  // 로그인한 사용자만 좋아요 메뉴 표시 (임시로 항상 표시)
  const userNavItems = [
    { path: '/favorites', label: '찜한 경매', icon: '❤️' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* 로고 */}
        <div className="nav-logo">
          <Link to="/" className="logo-link">
            <FaTrophy size={24} color="#FFD700" />
            <span className="logo-text">몬스터옥션</span>
          </Link>
        </div>

        {/* 메인 메뉴 */}
        <div className="nav-menu">
          <ul className="nav-list">
            {navItems.map((item) => {
              // 현재 경로가 해당 메뉴의 활성 상태인지 확인
              const isActive = (() => {
                if (item.path === '/') {
                  return location.pathname === '/';
                }
                if (item.path === '/auction') {
                  return location.pathname.startsWith('/auction');
                }
                if (item.path === '/customer-service') {
                  return location.pathname === '/customer-service';
                }
                // 관리자/사용자 페이지 구분
                if (isAdmin) {
                  // 관리자: admin 페이지가 활성화
                  return location.pathname.startsWith(item.path);
                } else {
                  // 사용자: 일반 페이지가 활성화
                  if (item.path === '/inquiry/my' || item.path === '/inquiry') {
                    return location.pathname.startsWith('/inquiry');
                  }
                  return location.pathname.startsWith(item.path);
                }
              })();

              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 사용자 메뉴 */}
        <div className="nav-user">
          {/* 사용자 전용 메뉴 */}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            
            {user && (
              <>
                <div style={{ position: 'relative', marginRight: '8px' }} ref={myPageRef}>
                  <div
                    className="auth-btn mypage-btn"
                    style={{ cursor: 'pointer' }}
                    onClick={toggleMyPage}
                    title="마이페이지"
                  >
                    <IoPersonCircle size={30} style={{ verticalAlign: 'middle' }} />
                  </div>
                  {myPageOpen && (
                    <div className="mypage-dropdown" style={{
                      position: 'absolute',
                      top: '32px',
                      right: 0,
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      minWidth: '160px',
                      zIndex: 1000,
                      padding: '8px 0'
                    }}>
                      <div style={{ padding: '8px 16px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>{user?.username || '마이페이지'}</div>
                      <button
                        className="dropdown-item"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer' }}
                        onClick={() => { setMyPageOpen(false); navigate('/messages'); }}
                      >
                        <FaEnvelope size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> 쪽지함
                      </button>
                      <button
                        className="dropdown-item"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer' }}
                        onClick={() => { setMyPageOpen(false); navigate('/notifications'); }}
                      >
                        <NotificationBell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> 알림
                      </button>
                      <button
                        className="dropdown-item"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer' }}
                        onClick={() => { setMyPageOpen(false); navigate('/favorites'); }}
                      >
                        <span style={{ marginRight: 8, verticalAlign: 'middle' }}>❤️</span> 찜한 경매
                      </button>
                      <button
                        className="dropdown-item"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', color: '#d32f2f' }}
                        onClick={() => { setMyPageOpen(false); handleLogout(); }}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
               
              </>
            )}
          </div>
          <div className="auth-buttons">
            {/* 로그인/회원가입: 로그인 안 한 경우만 노출 */}
            {!user && (
              <>
                <button
                  className="auth-btn login-btn"
                  onClick={() => navigate('/login')}
                  style={{ marginRight: '8px' }}
                >
                  로그인하기
                </button>
                <Link to="/register" className="auth-btn register-btn">회원가입</Link>
              </>
            )}
            {/* 마이페이지/로그아웃: 로그인한 경우만 노출 */}
          </div>
          {/* 권한 및 인사말: 로그인 시 평상문 안내 */}
          
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 