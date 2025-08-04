import { useEffect, useState, useCallback } from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import useNotificationSocket from '../hooks/useNotificationSocket';
import { toast } from 'react-toastify';
import '../style/NotificationBell.css';

function NotificationBell({ pageMode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  // 알림 목록을 가져오는 함수
  const fetchNotifications = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('알림 목록을 가져오는 중 오류 발생:', error);
      toast.error('알림을 불러오는 중 오류가 발생했습니다.');
    }
  }, [user]);

  // WebSocket을 통한 실시간 알림 처리
  const handleNewNotification = useCallback((newNotification) => {
    console.log('새 알림 수신:', newNotification);
    setNotifications(prev => [newNotification, ...prev]);
    
    // 토스트 알림 표시 (중복 방지를 위해 useNotificationSocket의 토스트는 제외)
    if (newNotification.message) {
      toast.info(newNotification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, []);

  // WebSocket 연결 설정
  useNotificationSocket(user?.username, {
    onNotification: handleNewNotification,
    addNotification: (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    }
  });

  // 초기 알림 로드 및 주기적 갱신
  useEffect(() => {
    if (!user?.username) return;
    
    // 초기 로드
    fetchNotifications();
    
    // 30초마다 알림 갱신
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleNotificationClick = (noti) => {
    if (noti.type === 'MESSAGE') {
      navigate(`/messages?messageId=${noti.messageId || ''}`);
    } else if (
      noti.type === 'AUCTION_ENDING_SOON' ||
      noti.type === 'FAVORITE_AUCTION' ||
      noti.type === 'AUCTION_WINNER' ||
      noti.type === 'BUY_NOW_SUCCESS' ||
      noti.type === 'BID_PLACED' ||
      noti.type === 'BUY_NOW'
    ) {
      if (noti.auctionId) {
        navigate(`/auction/${noti.auctionId}`);
      }
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case 'MESSAGE':
        return '쪽지';
      case 'AUCTION_ENDING_SOON':
        return '경매 마감 임박';
      case 'FAVORITE_AUCTION':
        return '찜한 경매';
      case 'AUCTION_WINNER':
        return '낙찰 알림';
      case 'BUY_NOW_SUCCESS':
      case 'BUY_NOW':
        return '즉시구매';
      case 'BID_PLACED':
        return '입찰 완료';
      default:
        return '알림';
    }
  };

  if (!pageMode) {
    return (
      <div className="notification-bell" style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ cursor: 'pointer', fontSize: 24 }} onClick={() => navigate('/notifications')}>
          🔔
        </span>
        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </div>
    );
  }

  return (
    <div className="notification-list-page" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>알림함</h2>
      {notifications.length === 0 && <div style={{ padding: 16 }}>알림이 없습니다.</div>}
      {notifications.map((noti) => (
        <div
          key={noti.id}
          className="notification-item"
          style={{
            padding: 16,
            borderBottom: '1px solid #eee',
            cursor: (noti.type === 'MESSAGE' || noti.type === 'AUCTION_ENDING_SOON' || noti.type === 'FAVORITE_AUCTION' || noti.type === 'AUCTION_WINNER' || noti.type === 'BUY_NOW_SUCCESS') ? 'pointer' : 'default'
          }}
          onClick={() => handleNotificationClick(noti)}
        >
          <strong style={{ color: '#007bff' }}>{getNotificationLabel(noti.type)}</strong>
          <div style={{ margin: '4px 0' }}>{noti.message}</div>
          <div className="notification-date" style={{ fontSize: 12, color: '#888' }}>{new Date(noti.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export default NotificationBell;
