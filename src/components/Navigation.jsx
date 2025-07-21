import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { FaTrophy } from 'react-icons/fa';
import { IoPersonCircle } from 'react-icons/io5';
import MyPageDropdown from './MyPageDropdown';
import PrivateMessage from './PrivateMessage'; // Import PrivateMessage
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'ADMIN';

  const [myPageOpen, setMyPageOpen] = useState(false);
  const [privateMessageOpen, setPrivateMessageOpen] = useState(false); // State for PrivateMessage
  const myPageRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (myPageRef.current && !myPageRef.current.contains(event.target)) {
        setMyPageOpen(false);
      }
    };

    if (myPageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [myPageOpen]);

  const toggleMyPage = () => {
    setMyPageOpen((prev) => !prev);
  };

  const togglePrivateMessage = () => { // Toggle function for PrivateMessage
    setPrivateMessageOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/auction', label: '경매', icon: '🔨' },
    { path: isAdmin ? '/event/admin' : '/event', label: '이벤트', icon: '🎁' },
    { path: isAdmin ? '/notice/admin' : '/notice', label: '공지사항', icon: '📢' },
    { path: isAdmin ? '/faq/admin' : '/faq', label: 'FAQ', icon: '❓' },
    { path: isAdmin ? '/inquiry/admin' : (user ? '/inquiry/my' : '/inquiry'), label: '1:1문의', icon: '💬' },
    { path: '/customer-service', label: '고객센터', icon: '📞' },
  ];

  const isLinkActive = (itemPath) => {
    if (itemPath === '/') return location.pathname === '/';
    if (itemPath === '/auction') return location.pathname.startsWith('/auction');
    if (itemPath === '/customer-service') return location.pathname === '/customer-service';
    if (isAdmin) return location.pathname.startsWith(itemPath);
    if (itemPath === '/inquiry/my' || itemPath === '/inquiry') return location.pathname.startsWith('/inquiry');
    return location.pathname.startsWith(itemPath);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="logo-link">
            <FaTrophy size={24} color="#FFD700" />
            <span className="logo-text">몬스터옥션</span>
          </Link>
        </div>

        <div className="nav-menu">
          <ul className="nav-list">
            {getNavItems().map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isLinkActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-user">
          {user ? (
            <div ref={myPageRef} style={{ position: 'relative' }}>
              <button
                className="auth-btn mypage-btn"
                onClick={toggleMyPage}
                title="마이페이지"
              >
                <IoPersonCircle size={30} />
              </button>
              <MyPageDropdown user={user} onLogout={handleLogout} isOpen={myPageOpen} setMyPageOpen={setMyPageOpen} onTogglePrivateMessage={togglePrivateMessage} />
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="auth-btn login-btn"
                onClick={() => navigate('/login')}
              >
                로그인하기
              </button>
              <Link to="/register" className="auth-btn register-btn">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
      {privateMessageOpen && <PrivateMessage isOpen={privateMessageOpen} onClose={togglePrivateMessage} />}
    </nav>
  );
};

export default Navigation;
 