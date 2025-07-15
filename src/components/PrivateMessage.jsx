import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import '../style/PrivateMessage.css';
import { useUser } from '../UserContext';

function PrivateMessage(props) {
  // UserContext에서 user 정보 가져오기
  const { user } = useUser();
  // props로 받은 값이 없으면 user에서 자동 세팅
  const auctionId = props.auctionId || '';
  const userId = props.userId || (user ? user.id : '');
  const userName = props.userName || (user ? user.nickname || user.name : '');
  const onClose = props.onClose || (() => window.history.back());

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '', receiverId: '', receiverName: '' });
  const [activeTab, setActiveTab] = useState('received'); // received, sent
  const stompClient = useRef(null);

  // 쪽지 목록 로드
  const loadMessages = async (type) => {
    try {
      const endpoint = type === 'received' ? 'received' : 'sent';
      const response = await fetch(`http://localhost:8080/api/messages/${endpoint}/${userId}`);
      if (response.ok) {
        const messageList = await response.json();
        setMessages(messageList);
      }
    } catch (error) {
      console.error('쪽지 로드 실패:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadMessages(activeTab);
  }, [userId, activeTab]);

  // WebSocket 연결 (새 쪽지 알림)
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-auction'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ 쪽지 WebSocket 연결됨');
        
        // 개인 쪽지 알림 구독
        client.subscribe(`/topic/messages/${userId}`, (message) => {
          const newPrivateMessage = JSON.parse(message.body);
          console.log('📝 새 쪽지 수신:', newPrivateMessage);
          
          // 받은 쪽지 탭이 활성화되어 있으면 목록에 추가
          if (activeTab === 'received') {
            setMessages(prev => [newPrivateMessage, ...prev]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ 쪽지 WebSocket 오류:', frame);
      },
    });

    stompClient.current = client;
    client.activate();

    return () => client.deactivate();
  }, [userId, activeTab]);

  // 쪽지 전송
  const sendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.content.trim() || !newMessage.receiverId.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `auctionId=${auctionId}&senderId=${userId}&senderName=${encodeURIComponent(userName)}&receiverId=${newMessage.receiverId}&receiverName=${encodeURIComponent(newMessage.receiverName)}&subject=${encodeURIComponent(newMessage.subject)}&content=${encodeURIComponent(newMessage.content)}`
      });

      if (response.ok) {
        alert('쪽지가 전송되었습니다.');
        setShowCompose(false);
        setNewMessage({ subject: '', content: '', receiverId: '', receiverName: '' });
        loadMessages(activeTab);
      } else {
        alert('쪽지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('쪽지 전송 실패:', error);
      alert('쪽지 전송에 실패했습니다.');
    }
  };

  // 쪽지 읽음 처리
  const markAsRead = async (messageId) => {
    try {
      await fetch(`http://localhost:8080/api/messages/${messageId}/read`, {
        method: 'PUT'
      });
      loadMessages(activeTab);
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  // 쪽지 삭제
  const deleteMessage = async (messageId) => {
    if (!confirm('쪽지를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('쪽지가 삭제되었습니다.');
        loadMessages(activeTab);
        setSelectedMessage(null);
      } else {
        alert('쪽지 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('쪽지 삭제 실패:', error);
      alert('쪽지 삭제에 실패했습니다.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // 로그인 안 했으면 아무것도 렌더링하지 않음
  if (!userId) return null;

  return (
    <div className="private-message">
      <div className="message-header">
        <h3>쪽지함</h3>
        <div className="message-tabs">
          <button 
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            받은 쪽지
          </button>
          <button 
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            보낸 쪽지
          </button>
        </div>
        <button className="compose-button" onClick={() => setShowCompose(true)}>
          쪽지 작성
        </button>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="message-content">
        <div className="message-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              {activeTab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`message-item ${!message.read && activeTab === 'received' ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read && activeTab === 'received') {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="message-info">
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-preview">
                    {activeTab === 'received' ? message.senderName : message.receiverName}
                  </div>
                  <div className="message-time">{formatTime(message.createdAt)}</div>
                </div>
                {!message.read && activeTab === 'received' && (
                  <div className="unread-indicator">●</div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedMessage && (
          <div className="message-detail">
            <div className="detail-header">
              <h4>{selectedMessage.subject}</h4>
              <div className="detail-actions">
                <button onClick={() => deleteMessage(selectedMessage.id)}>삭제</button>
                <button onClick={() => {
                  setShowCompose(true);
                  setNewMessage({
                    subject: `RE: ${selectedMessage.subject}`,
                    content: '',
                    receiverId: selectedMessage.senderId,
                    receiverName: selectedMessage.senderName
                  });
                }}>답장</button>
                <button onClick={() => setSelectedMessage(null)}>닫기</button>
              </div>
            </div>
            <div className="detail-info">
              <p><strong>보낸 사람:</strong> {selectedMessage.senderName}</p>
              <p><strong>받는 사람:</strong> {selectedMessage.receiverName}</p>
              <p><strong>시간:</strong> {formatTime(selectedMessage.createdAt)}</p>
            </div>
            <div className="detail-content">
              {selectedMessage.content}
            </div>
          </div>
        )}
      </div>

      {showCompose && (
        <div className="compose-modal">
          <div className="compose-content">
            <h4>쪽지 작성</h4>
            <div className="compose-form">
              <input
                type="text"
                placeholder="받는 사람 ID"
                value={newMessage.receiverId}
                onChange={(e) => setNewMessage(prev => ({ ...prev, receiverId: e.target.value }))}
              />
              <input
                type="text"
                placeholder="받는 사람 이름"
                value={newMessage.receiverName}
                onChange={(e) => setNewMessage(prev => ({ ...prev, receiverName: e.target.value }))}
              />
              <input
                type="text"
                placeholder="제목"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
              />
              <textarea
                placeholder="내용"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows="5"
              />
              <div className="compose-actions">
                <button onClick={sendMessage}>전송</button>
                <button onClick={() => setShowCompose(false)}>취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateMessage; 