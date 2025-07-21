import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useUser } from '../UserContext';
import './Notifications.css';

const Notifications = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/notifications/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-container" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>알림</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                <div className="notification-content">{notif.message}</div>
                <div className="notification-time">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
                 <button onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}>삭제</button>
              </div>
            ))
          ) : (
            <div className="no-notifications">새로운 알림이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
