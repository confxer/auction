import { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import '../style/NotificationBell.css';

function NotificationBell({ pageMode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.username || !user.accessToken) return;
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notifications/${user.username}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // 알림 클릭 시 라우팅
  const handleNotificationClick = (noti) => {
    if (noti.type === 'MESSAGE') {
      navigate(`/messages?messageId=${noti.messageId || ''}`);
    } else if (noti.type === 'AUCTION_ENDING_SOON' || noti.type === 'FAVORITE_AUCTION') {
      if (noti.auctionId) {
        navigate(`/auction/${noti.auctionId}`);
      }
    }
  };

  if (!pageMode) {
    // 종 아이콘 + 알림 개수 뱃지 (드롭다운 없음)
    return (
      <div className="notification-bell" style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ cursor: 'pointer', fontSize: 24 }} onClick={() => navigate('/notifications')}>
          🔔
        </span>
        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </div>
    );
  }

  // 알림함 페이지 전체 리스트
  return (
    <div className="notification-list-page" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>알림함</h2>
      {notifications.length === 0 && <div style={{ padding: 16 }}>알림이 없습니다.</div>}
      {notifications.map((noti) => (
        <div
          key={noti.id}
          className="notification-item"
          style={{ padding: 16, borderBottom: '1px solid #eee', cursor: (noti.type === 'MESSAGE' || noti.type === 'AUCTION_ENDING_SOON' || noti.type === 'FAVORITE_AUCTION') ? 'pointer' : 'default' }}
          onClick={() => handleNotificationClick(noti)}
        >
          <strong style={{ color: '#007bff' }}>
            {noti.type === 'MESSAGE' ? '쪽지' : noti.type === 'AUCTION_ENDING_SOON' ? '경매 마감 임박' : noti.type === 'FAVORITE_AUCTION' ? '찜한 경매' : '알림'}
          </strong>
          <div style={{ margin: '4px 0' }}>{noti.message}</div>
          <div className="notification-date" style={{ fontSize: 12, color: '#888' }}>{new Date(noti.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export default NotificationBell; 