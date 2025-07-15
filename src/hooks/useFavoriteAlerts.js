import { useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';

export const useFavoriteAlerts = () => {
  const { user } = useUser();
  const alertShownRef = useRef(new Set());
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // 브라우저 알림 권한 요청
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();

    // 마감 임박 경매 체크 함수
    const checkEndingSoonFavorites = async () => {
      try {
        const response = await axios.get(`favorites/user/${user.id}/ending-soon`);
        const endingSoonFavorites = response.data || [];

        endingSoonFavorites.forEach(favorite => {
          const alertKey = `${favorite.auctionId}-${favorite.auctionEndTime}`;
          
          // 이미 알림을 보낸 경매는 제외
          if (alertShownRef.current.has(alertKey)) return;

          // 마감까지 남은 시간 계산
          const now = new Date().getTime();
          const endTime = new Date(favorite.auctionEndTime).getTime();
          const remainingMinutes = Math.floor((endTime - now) / (1000 * 60));

          // 30분 이내인 경우에만 알림
          if (remainingMinutes <= 30 && remainingMinutes > 0) {
            // 브라우저 알림
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('경매 마감 임박!', {
                body: `"${favorite.auctionTitle}" 경매가 ${remainingMinutes}분 후에 마감됩니다.`,
                icon: '/favicon.ico',
                tag: alertKey, // 중복 알림 방지
                requireInteraction: true
              });
            }

            // 소리 알림
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
              audio.play();
            } catch (error) {
              console.log('소리 재생 실패:', error);
            }

            // 알림 표시 완료 표시
            alertShownRef.current.add(alertKey);
          }
        });
      } catch (error) {
        console.error('마감 임박 경매 체크 실패:', error);
      }
    };

    // 초기 체크
    checkEndingSoonFavorites();

    // 1분마다 체크
    intervalRef.current = setInterval(checkEndingSoonFavorites, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}; 