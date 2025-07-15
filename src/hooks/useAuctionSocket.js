// src/hooks/useAuctionSocket.js
import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function useAuctionSocket(onUpdate) {
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-auction'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[✅ WebSocket 연결됨]');
        client.subscribe('/topic/auction-updates', (message) => {
          const updated = JSON.parse(message.body);
          console.log('📡 실시간 데이터 수신:', updated);
          onUpdate(updated);
        });
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket STOMP 오류:', frame);
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [onUpdate]);
}
