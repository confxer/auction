import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { useUser } from '../UserContext';
import { useNotifications } from '../hooks/NotificationContext';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { format } from 'date-fns';
import './Notifications.css';

const Notifications = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { notifications, markAsRead: markAsReadContext, deleteNotification, setNotifications } = useNotifications();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Format date to a readable format
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    const typeLabels = {
      BID: '입찰',
      BUY_NOW: '즉시구매',
      MESSAGE: '쪽지',
      AUCTION_END: '경매 종료',
      PAYMENT: '결제',
      SHIPPING: '배송',
      SYSTEM: '시스템 알림'
    };
    return typeLabels[type] || type;
  };

  // Debug effect to track notifications state
  useEffect(() => {
    console.log('Current notifications state:', notifications);
  }, [notifications]);

  // Use the notification socket hook
  useNotificationSocket(user?.id, {
    onNotification: (newNotification) => {
      // Check if this is an important notification (bid success, purchase, etc.)
      const isImportantNotification = 
        newNotification.message.includes('입찰') || 
        newNotification.message.includes('즉시구매') ||
        newNotification.message.includes('낙찰') ||
        newNotification.type === 'BID_PLACED' ||
        newNotification.type === 'BUY_NOW' ||
        newNotification.type === 'BUY_NOW_SUCCESS' ||
        newNotification.type === 'WINNER';
      
      // Add to the top of the list
      const notificationWithDefaults = {
        ...newNotification,
        read: newNotification.read || false,
        createdAt: newNotification.createdAt || new Date().toISOString()
      };
      
      setNotifications(prev => [notificationWithDefaults, ...prev]);
      
      // Show toast for important notifications
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
      // This will be called by useNotificationSocket when a new notification is received
      const notificationWithDefaults = {
        ...notification,
        read: notification.read || false,
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
    console.log('fetchNotifications called for user:', user?.id);
    if (!user?.id) {
      console.error('No user ID available for fetching notifications');
      return;
    }
    
    try {
      console.log('Fetching notifications from server...');
      const response = await axios.get(`/api/notifications/${user.id}`, {
        params: {
          _t: Date.now(), // Prevent caching
          sort: 'created_at',
          order: 'desc'
        }
      });
      
      // Process notifications to match our expected format
      const processedNotifications = response.data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        auctionId: notification.auction_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read === 1 || notification.is_read === true,
        createdAt: notification.created_at || new Date().toISOString(),
        sellerId: notification.seller_id
      }));
      
      setNotifications(processedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('알림을 불러오는 중 오류가 발생했습니다.');
      
      // If there's an error, show a sample notification for testing
      if (process.env.NODE_ENV === 'development') {
        setNotifications([{
          id: 'sample-1',
          message: '테스트: 입찰 성공!',
          read: false,
          createdAt: new Date().toISOString()
        }, {
          id: 'sample-2',
          message: '테스트: 상품이 즉시구매되었습니다!',
          read: false,
          createdAt: new Date().toISOString()
        }]);
      }
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      // Optimistically update UI
      markAsReadContext(id);
      
      // Update the notification as read in the backend
      await axios.put(`/api/notifications/${id}`, {
        is_read: true
      });
      
      // Refresh the list to ensure consistency
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('알림을 읽음 처리하는 중 오류가 발생했습니다.');
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    try {
      // Optimistically remove the notification from UI
      const notificationToDelete = notifications.find(n => n.id === id);
      deleteNotification(id);
      
      // Make the API call to delete the notification
      await axios.delete(`/api/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Revert the UI if the API call fails
      if (notificationToDelete) {
        setNotifications(prev => [notificationToDelete, ...prev]);
      }
      
      // Show appropriate error message
      if (error.response?.status === 403) {
        setError('이 알림을 삭제할 권한이 없습니다.');
      } else {
        setError('알림 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
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
                className={`notification-item ${!notif.isRead ? 'unread' : 'read'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Mark as read when clicked if not already read
                  if (!notif.isRead) {
                    handleMarkAsRead(notif.id, e);
                  }
                  
                  // Handle different notification types
                  if (notif.type === 'MESSAGE') {
                    navigate(`/messages?auctionId=${notif.auctionId || ''}`);
                  } else if (notif.auctionId) {
                    // For auction-related notifications, navigate to the auction
                    navigate(`/auction/${notif.auctionId}`);
                  }
                  
                  // Close the notification panel
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
                      <span className="notification-type">{getNotificationTypeLabel(notif.type)}</span>
                      {notif.auctionId && (
                        <span className="notification-auction">경매 ID: {notif.auctionId}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="notification-footer">
                  <div className="notification-time">
                    {formatDate(notif.createdAt)}
                  </div>
                  <button 
                    className="delete-button"
                    onClick={(e) => handleDelete(notif.id, e)}
                    aria-label="알림 삭제"
                  >
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