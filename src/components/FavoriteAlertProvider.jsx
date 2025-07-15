import React from 'react';
import { useFavoriteAlerts } from '../hooks/useFavoriteAlerts';

const FavoriteAlertProvider = ({ children }) => {
  // 좋아요 알림 기능 활성화
  useFavoriteAlerts();
  
  return <>{children}</>;
};

export default FavoriteAlertProvider; 