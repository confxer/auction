import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonCircle } from 'react-icons/io5';
import { FaEnvelope, FaHeart, FaBell } from 'react-icons/fa';
import './MyPageDropdown.css';

const MyPageDropdown = ({ user, onLogout, isOpen, setMyPageOpen, onTogglePrivateMessage, onToggleNotifications }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setMyPageOpen(false);
    navigate(path);
  };

  const menuItems = [
    { path: '/mypage', icon: <IoPersonCircle size={16} className="icon" />, label: '마이페이지', action: () => handleNavigation('/mypage') },
    { icon: <FaEnvelope size={16} className="icon" />, label: '쪽지함', action: () => { setMyPageOpen(false); onTogglePrivateMessage(); } },
    { icon: <FaBell size={16} className="icon" />, label: '알림', action: () => { setMyPageOpen(false); onToggleNotifications(); } },
    { path: '/favorites', icon: <FaHeart size={16} className="icon" />, label: '찜한 경매', action: () => handleNavigation('/favorites') },
  ];

  return (
    <div className={`mypage-dropdown ${isOpen ? 'open' : ''}`}>
      <div className="dropdown-header">{user?.username || '마이페이지'}</div>
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="dropdown-item"
          onClick={item.action}
        >
          {item.icon} {item.label}
        </button>
      ))}
      <div className="dropdown-divider"></div>
      <button
        className="dropdown-item logout-item"
        onClick={() => {
          setMyPageOpen(false);
          onLogout();
        }}
      >
        로그아웃
      </button>
    </div>
  );
};

export default MyPageDropdown;
