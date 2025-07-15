import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import FavoriteButton from '../components/FavoriteButton';
import '../style/Favorites.css';

const Favorites = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그인 체크 (비활성화)
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // 디버깅용 로그
  console.log('Favorites 컴포넌트 렌더링:', { user, loading, favorites });

  // 좋아요 목록 로드
  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/favorites/user/${user.id}`);
      setFavorites(response.data || []);
    } catch (error) {
      console.error('좋아요 목록 로드 실패:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // 남은 시간 계산
  const calculateRemainingTime = (endAt) => {
    if (!endAt) return { hours: 0, minutes: 0, seconds: 0, isEnded: true };
    
    const now = currentTime.getTime();
    const end = new Date(endAt).getTime();
    const diff = end - now;
    
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isEnded: true };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, isEnded: false };
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 이미지 URL 처리
  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/300x200?text=No+Image";
    if (url.startsWith('/uploads/')) {
      return `/api${url}`;
    }
    return url;
  };

  // 좋아요 제거 처리
  const handleFavoriteRemove = (auctionId) => {
    setFavorites(prev => prev.filter(fav => fav.auctionId !== auctionId));
  };

  // 진행중인 경매만 필터링
  const activeFavorites = favorites.filter(favorite => {
    if (!favorite.auctionEndTime) return false;
    const now = currentTime.getTime();
    const end = new Date(favorite.auctionEndTime).getTime();
    return end > now;
  });

  // 마감 30분 전인 경매 필터링
  const endingSoonFavorites = favorites.filter(favorite => {
    if (!favorite.auctionEndTime) return false;
    const now = currentTime.getTime();
    const end = new Date(favorite.auctionEndTime).getTime();
    const diff = end - now;
    return diff > 0 && diff <= 30 * 60 * 1000; // 30분 이내
  });

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
        <p>좋아요 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>❤️ 내가 찜한 경매</h1>
        <p>총 {favorites.length}개의 경매를 찜했습니다</p>
      </div>

      {/* 마감 30분 전 알림 */}
      {endingSoonFavorites.length > 0 && (
        <div className="ending-soon-alert">
          <div className="alert-icon">⏰</div>
          <div className="alert-content">
            <h3>마감 임박!</h3>
            <p>{endingSoonFavorites.length}개의 찜한 경매가 30분 내에 마감됩니다.</p>
            <button 
              className="alert-sound-btn"
              onClick={() => {
                // 브라우저 알림 요청
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('경매 마감 임박!', {
                    body: `${endingSoonFavorites.length}개의 찜한 경매가 곧 마감됩니다.`,
                    icon: '/favicon.ico'
                  });
                }
                // 소리 재생
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                audio.play();
              }}
            >
              🔔 알림음 재생
            </button>
          </div>
        </div>
      )}

      {/* 진행중인 경매 */}
      <section className="active-favorites-section">
        <h2>진행중인 경매 ({activeFavorites.length})</h2>
        {activeFavorites.length > 0 ? (
          <div className="favorites-grid">
            {activeFavorites.map((favorite) => {
              const { hours, minutes, seconds, isEnded } = calculateRemainingTime(favorite.auctionEndTime);
              const currentPrice = Math.max(favorite.auctionStartPrice, favorite.auctionHighestBid || 0);
              
              return (
                <div key={favorite.id} className="favorite-card">
                  <div className="favorite-image">
                    <img src={getImageUrl(favorite.auctionImageUrl)} alt={favorite.auctionTitle} />
                    <div className="favorite-category">{favorite.auctionCategory}</div>
                    <FavoriteButton 
                      auctionId={favorite.auctionId} 
                      initialIsFavorited={true}
                      onFavoriteChange={(isFavorited) => {
                        if (!isFavorited) {
                          handleFavoriteRemove(favorite.auctionId);
                        }
                      }}
                    />
                  </div>
                  <Link to={`/auction/${favorite.auctionId}`} className="favorite-content-link">
                    <div className="favorite-content">
                      <h3 className="favorite-title">{favorite.auctionTitle}</h3>
                      <div className="favorite-price">
                        <span className="price-label">현재가</span>
                        <span className="price-value">{formatPrice(currentPrice)}원</span>
                      </div>
                      <div className="favorite-time">
                        <span className="time-label">남은 시간</span>
                        <span className={`time-value ${isEnded ? 'ended' : ''}`}>
                          {isEnded ? '종료됨' : `${hours}시간 ${minutes}분 ${seconds}초`}
                        </span>
                      </div>
                      <div className="favorite-meta">
                        <span className="favorite-date">
                          찜한 날짜: {new Date(favorite.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="favorite-link">
                        입찰하러 가기 →
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-favorites">
            <div className="no-favorites-icon">💔</div>
            <p>진행중인 찜한 경매가 없습니다.</p>
            <Link to="/" className="browse-link">경매 둘러보기</Link>
          </div>
        )}
      </section>

      {/* 마감된 경매 */}
      {favorites.length > activeFavorites.length && (
        <section className="ended-favorites-section">
          <h2>마감된 경매 ({favorites.length - activeFavorites.length})</h2>
          <div className="favorites-grid">
            {favorites
              .filter(favorite => {
                if (!favorite.auctionEndTime) return false;
                const now = currentTime.getTime();
                const end = new Date(favorite.auctionEndTime).getTime();
                return end <= now;
              })
              .map((favorite) => (
                <div key={favorite.id} className="favorite-card ended">
                  <div className="favorite-image">
                    <img src={getImageUrl(favorite.auctionImageUrl)} alt={favorite.auctionTitle} />
                    <div className="favorite-category">{favorite.auctionCategory}</div>
                    <div className="auction-ended">경매 종료</div>
                    <FavoriteButton 
                      auctionId={favorite.auctionId} 
                      initialIsFavorited={true}
                      onFavoriteChange={(isFavorited) => {
                        if (!isFavorited) {
                          handleFavoriteRemove(favorite.auctionId);
                        }
                      }}
                    />
                  </div>
                  <div className="favorite-content">
                    <h3 className="favorite-title">{favorite.auctionTitle}</h3>
                    <div className="favorite-price">
                      <span className="price-label">최종가</span>
                      <span className="price-value">{formatPrice(favorite.auctionHighestBid || favorite.auctionStartPrice)}원</span>
                    </div>
                    <div className="favorite-meta">
                      <span className="favorite-date">
                        찜한 날짜: {new Date(favorite.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Favorites; 