import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import './FavoriteButton.css';

const FavoriteButton = ({ auctionId, initialIsFavorited = false, onFavoriteChange }) => {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 좋아요 상태 확인 (항상 호출되도록 수정)
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        if (user && auctionId) {
          const response = await axios.get(`/api/favorites/${auctionId}/check?userId=${user.id}`);
          setIsFavorited(response.data.isFavorited);
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, auctionId]);

  // 사용자가 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="favorite-button-container">
        <button 
          className="favorite-button guest"
          onClick={() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
          }}
          title="로그인이 필요합니다"
        >
          <span className="favorite-icon">🤍</span>
        </button>
        {showTooltip && (
          <div className="favorite-tooltip">
            로그인 후 좋아요 기능을 사용할 수 있습니다
          </div>
        )}
      </div>
    );
  }

  // 좋아요 토글
  const handleFavoriteToggle = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`/api/favorites/${auctionId}/toggle?userId=${user.id}`);
      
      if (response.data.success) {
        setIsFavorited(response.data.isFavorited);
        if (onFavoriteChange) {
          onFavoriteChange(response.data.isFavorited);
        }
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="favorite-button-container">
      <button 
        className={`favorite-button ${isFavorited ? 'favorited' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleFavoriteToggle}
        disabled={isLoading}
        title={isFavorited ? '좋아요 해제' : '좋아요 추가'}
      >
        <span className="favorite-icon">
          {isFavorited ? '❤️' : '🤍'}
        </span>
        {isLoading && <span className="loading-spinner"></span>}
      </button>
    </div>
  );
};

export default FavoriteButton; 