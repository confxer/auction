// hooks/useNotificationSocket.js
import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import axios from '../axiosConfig';

const useNotificationSocket = (userId, { onNotification, addNotification }) => {
  const stompClient = useRef(null);
  const stompSubscription = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const saveNotification = useCallback(async (notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('🔐 No auth token');
        return null;
      }

      const notificationData = {
        userId: notification.userId || userId,
        message: notification.message,
        type: notification.type || 'info'
      };

      const response = await axios.post(`/api/notifications`, notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.warn('🚫 Failed to save notification:', error.message);
      return null;
    }
  }, [userId]);

  const connect = useCallback(() => {
    if (!userId || stompClient.current?.connected) {
      console.log("⛔ Already connected or missing userId");
      return;
    }

    const socket = new SockJS("http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/ws-auction");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        reconnectAttempts.current = 0;
        const destination = `/topic/notifications/${userId}`;
        console.log(`✅ STOMP 연결됨 → 구독 경로: ${destination}`);

        if (stompSubscription.current) {
          stompSubscription.current.unsubscribe();
        }

        const subscription = client.subscribe(destination, async (message) => {
          try {
            console.log("📨 원본 메시지 수신:", message.body);
            let notification = JSON.parse(message.body);

            if (!notification || !notification.message || !notification.type) {
              console.warn('⚠️ 잘못된 알림 포맷:', notification);
              return;
            }

            // 저장용 가공
            const notificationToSave = {
              ...notification,
              userId: notification.userId || userId,
              type: notification.type || 'info',
              createdAt: notification.createdAt || new Date().toISOString()
            };

            // DB에 저장
            const savedNotification = await saveNotification(notificationToSave);

            // ✅ toast 표시
            if (savedNotification) {
              const { type, message: msg } = savedNotification;

              if (type === 'BUY_NOW_SUCCESS') {
                toast.success(msg || '✅ 즉시구매가 완료되었습니다!');
              } else if (type === 'SOLD') {
                toast.info(msg || '💰 상품이 판매되었습니다.');
              } else if (type === 'WIN') {
                toast.success(msg || '🏆 경매에서 낙찰되었습니다!');
              } else if (type === 'MESSAGE') {
                toast.info(msg || '📬 새 쪽지가 도착했습니다!');
              } else {
                toast(msg || '🔔 새로운 알림이 도착했습니다');
              }

              // 상태에 저장
              if (addNotification) addNotification(savedNotification);
              if (onNotification) onNotification(savedNotification);

              console.log("📩 toast 표시 완료:", savedNotification.message);
            }
          } catch (error) {
            console.error('❌ 알림 처리 중 예외:', error);
            toast.error('❌ 알림 처리 실패');
          }
        });

        stompSubscription.current = subscription;
      },
      onDisconnect: () => {
        console.log("🔌 STOMP 연결 종료");
      },
      onStompError: (frame) => {
        console.error('❗ STOMP 프로토콜 오류:', frame.headers?.message || 'Unknown');
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(`🔁 재연결 시도 (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
        } else {
          console.error('🚫 재연결 초과');
        }
      },
      onWebSocketClose: (event) => {
        console.log('🔒 WebSocket 닫힘:', event);
        stompClient.current = null;
      }
    });

    stompClient.current = client;
    client.activate();
  }, [userId, onNotification, addNotification, saveNotification]);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ userId 없음으로 WebSocket 미연결");
      return;
    }

    connect();

    return () => {
      console.log('🧹 WebSocket 정리 중...');
      if (stompClient.current) {
        if (stompSubscription.current) {
          stompSubscription.current.unsubscribe();
          stompSubscription.current = null;
        }

        if (stompClient.current.connected) {
          stompClient.current.deactivate()
            .then(() => console.log('🛑 STOMP 비활성화 완료'))
            .catch(err => console.error('❌ 비활성화 실패:', err));
        }

        stompClient.current = null;
      }
    };
  }, [userId, connect]);

  return stompClient.current;
};

export default useNotificationSocket;
