import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from '../UserContext';
import './NotificationBell.css';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    if (!user) return;
    // 알림 목록 초기 로드
    fetch(`/notifications/${user.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data || []));
    // WebSocket 연결
    const socket = new SockJS('http://localhost:8080/ws-auction');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const notification = JSON.parse(message.body);
          setNotifications(prev => [notification, ...prev]);
        });
      }
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [user]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  return (
    <div className="notification-bell" ref={bellRef}>
      <button className="bell-btn" onClick={() => setShowDropdown(v => !v)}>
        <FaBell size={20} />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">알림</div>
          {notifications.length === 0 ? (
            <div className="dropdown-empty">알림이 없습니다.</div>
          ) : (
            <ul className="dropdown-list">
              {notifications.slice(0, 10).map((n, i) => (
                <li key={i} className={`dropdown-item ${!n.read && !n.isRead ? 'unread' : ''}`}>
                  <div className="item-title">{n.title || n.type}</div>
                  <div className="item-message">{n.message}</div>
                  <div className="item-date">{n.createdAt?.replace('T', ' ').slice(0, 16)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
export default NotificationBell; 