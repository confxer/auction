import { useState, useEffect, useRef } from 'react';
import '../style/ChatRoom.css';

function ChatRoom({ auctionId, roomName, userId, userName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 메시지 목록 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅방 생성 또는 조회
  useEffect(() => {
    const createOrGetChatRoom = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/chat/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `auctionId=${auctionId}&roomName=${encodeURIComponent(roomName)}`
        });
        if (response.ok) {
          const room = await response.json();
          setRoomId(room.id);
          loadMessages(room.id);
        }
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
      }
    };
    if (auctionId && roomName) {
      createOrGetChatRoom();
    }
  }, [auctionId, roomName]);

  // 메시지 목록 로드
  const loadMessages = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/rooms/${roomId}/messages`);
      if (response.ok) {
        const messageList = await response.json();
        setMessages(messageList);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // WebSocket 연결
  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`ws://localhost:8080/ws-auction/websocket`);
    wsRef.current = ws;
    ws.onopen = () => {
      setIsConnected(true);
      // 입장 메시지
      ws.send(JSON.stringify({
        roomId: roomId,
        senderId: userId,
        senderName: userName,
        message: `${userName}님이 입장하셨습니다.`,
        messageType: 'JOIN'
      }));
    };
    ws.onmessage = (event) => {
      try {
        const chatMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, chatMessage]);
      } catch (e) {}
    };
    ws.onclose = () => {
      setIsConnected(false);
    };
    ws.onerror = () => {
      setIsConnected(false);
    };
    return () => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          roomId: roomId,
          senderId: userId,
          senderName: userName,
          message: `${userName}님이 퇴장하셨습니다.`,
          messageType: 'LEAVE'
        }));
      }
      ws.close();
    };
  }, [roomId, userId, userName]);

  // 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // Optimistic UI
    setMessages(prev => [
      ...prev,
      {
        roomId: roomId,
        senderId: userId,
        senderName: userName,
        message: newMessage.trim(),
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        local: true
      }
    ]);
    // WebSocket 연결되어 있으면 서버로도 전송
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        roomId: roomId,
        senderId: userId,
        senderName: userName,
        message: newMessage.trim(),
        messageType: 'TEXT'
      }));
    }
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageClass = (message) => {
    if (message.messageType === 'SYSTEM') return 'system-message';
    if (message.senderId === userId) return 'my-message';
    return 'other-message';
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{roomName}</h3>
        <div className="chat-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>{isConnected ? '🟢' : '🔴'}</span>
          <span className="status-text">{isConnected ? '연결됨' : '연결 끊김'}</span>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${getMessageClass(message)}`}>
            {message.messageType === 'SYSTEM' ? (
              <div className="system-message-content">{message.message}</div>
            ) : (
              <>
                <div className="message-header">
                  <span className="sender-name">{message.senderName}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
                <div className="message-content">{message.message}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          disabled={false}
        />
        <button 
          onClick={sendMessage} 
          disabled={!newMessage.trim()}
          className="send-button"
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatRoom; 