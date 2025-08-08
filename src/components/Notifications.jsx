import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { useUser } from '../UserContext';
import { useNotifications } from '../hooks/NotificationContext';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { format } from 'date-fns';
import './Notifications.css';
import { toast } from 'react-toastify'; // toast 사용 시 반드시 import 필요

const Notifications = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { notifications, markAsRead: markAsReadContext, deleteNotification, setNotifications } = useNotifications();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  useNotificationSocket(user?.id, {
    onNotification: (newNotification) => {
      const isImportantNotification = 
        newNotification.message.includes('입찰') || 
        newNotification.message.includes('즉시구매') ||
        newNotification.message.includes('낙찰') ||
        newNotification.type === 'BID_PLACED' ||
        newNotification.type === 'BUY_NOW' ||
        newNotification.type === 'BUY_NOW_SUCCESS' ||
        newNotification.type === 'WINNER';

      const notificationWithDefaults = {
        ...newNotification,
        isRead: newNotification.isRead ?? newNotification.read ?? newNotification.is_read ?? 0,
        createdAt: newNotification.createdAt || new Date().toISOString()
      };

      setNotifications(prev => [notificationWithDefaults, ...prev]);

      if (isImportantNotification) {
        toast.success(newNotification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
    addNotification: (notification) => {
      const notificationWithDefaults = {
        ...notification,
        isRead: notification.isRead ?? notification.read ?? notification.is_read ?? 1,
        createdAt: notification.createdAt || new Date().toISOString()
      };
      setNotifications(prev => [notificationWithDefaults, ...prev]);
    }
  });

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`/api/notifications/${user.id}`, {
        params: {
          _t: Date.now(),
          sort: 'created_at',
          order: 'desc'
        }
      });

      const processedNotifications = response.data.map(notification => {
        const isRead =
          notification.isRead !== undefined ? Number(notification.isRead) :
          notification.is_read !== undefined ? Number(notification.is_read) :
          notification.read !== undefined ? Number(notification.read) : 0;

        return {
          id: notification.id,
          userId: notification.userId,
          auctionId: notification.auctionId,
          type: notification.type,
          title: notification.title || '새 알림',
          message: notification.message,
          isRead: isRead === 1 ? 1 : 0,
          createdAt: notification.createdAt,
          sellerId: notification.sellerId
        };
      });

      setNotifications(processedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('알림을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation?.();
  
    try {
      const notification = notifications.find(n => n.id === id);
      if (!notification || notification.isRead === 1) return;
  
      // 상태 업데이트
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
      console.log(`🔵 [markAsRead] 알림 ID ${id} 를 읽음 처리 (프론트 상태)`);
  
      // 서버에 읽음 처리 요청
      await axios.post(`/api/notifications/read/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
  
      console.log(`🟢 [markAsRead] 알림 ID ${id} 읽음 처리 완료 (서버 반영)`);
  
      if (markAsReadContext) {
        markAsReadContext(id);
      }
  
    } catch (error) {
      console.error('❌ [markAsRead] 읽음 처리 오류:', error);
      setError('알림 읽음 처리 중 오류 발생');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    const notificationToDelete = notifications.find(n => n.id === id);
    deleteNotification(id);

    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (notificationToDelete) {
        setNotifications(prev => [notificationToDelete, ...prev]);
      }
      setError('알림 삭제 중 오류 발생');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-container" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>🔔 알림</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="notifications-list">
          {error && <div className="notification-error">{error}</div>}
          {notifications && notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${notif.isRead === 0 ? 'unread' : 'read'}`}
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleMarkAsRead(notif.id, e);

                  if (notif.type === 'MESSAGE') {
                    navigate(`/messages?auctionId=${notif.auctionId || ''}`);
                  } if (notif.type === 'NEW_BID' || notif.type === 'BUY_NOW_SUCCESS' || notif.type === 'SOLD') {
                    navigate(`/auction/${notif.auctionId}/pay`);
                  } else if (notif.auctionId) {
                    navigate(`/auction/${notif.auctionId}`);
                  }

                  onClose();
                }}
              >
                <div className="notification-content">
                  <span className={`notification-dot ${!notif.isRead ? 'unread-dot' : ''}`}></span>
                  <div className="notification-icon">
                    {notif.type === 'BID' && '💰'}
                    {notif.type === 'BUY_NOW' && '🛒'}
                    {notif.type === 'MESSAGE' && '✉️'}
                    {notif.type === 'AUCTION_END' && '⏰'}
                    {notif.type === 'PAYMENT' && '💳'}
                    {notif.type === 'SHIPPING' && '🚚'}
                    {!['BID', 'BUY_NOW', 'MESSAGE', 'AUCTION_END', 'PAYMENT', 'SHIPPING'].includes(notif.type) && '🔔'}
                  </div>
                  <div className="notification-message">
                    <div className="notification-title">{notif.title || '새 알림'}</div>
                    <div className="notification-text">{notif.message}</div>
                    <div className="notification-meta">
                      
                    </div>
                  </div>
                </div>
                <div className="notification-footer">
                  <div className="notification-time">{formatDate(notif.createdAt)}</div>
                  <button className="delete-button" onClick={(e) => handleDelete(notif.id, e)} aria-label="알림 삭제">
                    ×
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">📭 새로운 알림이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
