// hooks/useNotificationSocket.js
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";

const useNotificationSocket = (userId, onNotification) => {
  const stompClient = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS("http://localhost:8080/ws-auction");

    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    stompClient.current.onConnect = () => {
      console.log("✅ WebSocket 연결됨");

      // 유저별 구독 경로
      stompClient.current.subscribe(
        `/topic/notifications/${userId}`,
        (message) => {
          const notification = JSON.parse(message.body);
          console.log("📩 실시간 알림 수신:", notification);

          // Toast 팝업
          toast.info(notification.message, {
            position: "top-right",
            autoClose: 5000,
          });

          // Optional: 상태 업데이트용 콜백 호출
          if (onNotification) {
            onNotification(notification);
          }
        }
      );
    };

    stompClient.current.activate();

    return () => {
      stompClient.current?.deactivate();
    };
  }, [userId, onNotification]);
};

export default useNotificationSocket;
