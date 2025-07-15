import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Home.css";
import axios from '../axiosConfig';
import useAuctionSocket from '../hooks/useAuctionSocket';
import FavoriteButton from '../components/FavoriteButton';
import TimeDisplay from '../components/TimeDisplay';
import { useUser } from '../UserContext';

const Home = ({ dashboardData }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [auctions, setAuctions] = useState(dashboardData?.auctions || []);
  const [favoritedAuctions, setFavoritedAuctions] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // 실시간 경매 업데이트 콜백
  const handleAuctionUpdate = useCallback((updatedAuction) => {
    setAuctions(prevAuctions => {
      const updatedAuctions = prevAuctions.map(auction => 
        auction.id === updatedAuction.id ? { ...auction, ...updatedAuction } : auction
      );
      return updatedAuctions;
    });
  }, []);

  // WebSocket 연결
  useAuctionSocket(handleAuctionUpdate);

  // dashboardData가 변경될 때 auctions 상태 업데이트
  useEffect(() => {
    if (dashboardData?.auctions) {
      setAuctions(dashboardData.auctions);
    }
  }, [dashboardData?.auctions]);

  // 찜한 경매 목록 로드
  useEffect(() => {
    if (user) {
      loadFavoritedAuctions();
    }
  }, [user, auctions]);

  const loadFavoritedAuctions = async () => {
    if (!user) return;
    
    try {
      setLoadingFavorites(true);
      const response = await axios.get(`/api/favorites/user/${user.id}`);
      const favorites = response.data || [];
      
      // 찜한 경매 ID 목록 생성
      const favoritedIds = favorites.map(fav => fav.auctionId);
      
      // 전체 경매 중에서 찜한 경매만 필터링
      const favorited = auctions.filter(auction => favoritedIds.includes(auction.id));
      setFavoritedAuctions(favorited);
    } catch (error) {
      console.error('찜한 경매 로드 실패:', error);
      setFavoritedAuctions([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // 카테고리 목록
  const categories = ['전체', '가전', '전자제품', '패션', '명품', '도서', '취미', '스포츠'];
  
  // 진행중인 경매만 필터링 (마감되지 않은 경매)
  const activeAuctions = auctions.filter(auction => {
    if (!auction.endAt) return false;
    const now = new Date().getTime();
    const end = new Date(auction.endAt).getTime();
    return end > now; // 아직 마감되지 않은 경매만
  });

  // 진행중인 찜한 경매만 필터링
  const activeFavoritedAuctions = favoritedAuctions.filter(auction => {
    if (!auction.endAt) return false;
    const now = new Date().getTime();
    const end = new Date(auction.endAt).getTime();
    return end > now;
  });

  // 카테고리별 경매 필터링 (진행중인 경매 중에서)
  const filteredAuctions = selectedCategory === '전체' 
    ? activeAuctions
    : activeAuctions.filter(auction => auction.category === selectedCategory);





  // 경매 카드 컴포넌트
  const AuctionCard = ({ auction, isFavorited = false }) => {
    
    // 이미지 소스 결정 로직 - Auction 페이지와 동일하게
    const getImageSrc = () => {
      if (!auction.imageUrl1) return "https://placehold.co/300x200?text=No+Image";
      if (auction.imageUrl1.startsWith('/uploads/')) {
        return `/api${auction.imageUrl1}`;
      }
      return auction.imageUrl1;
    };
    
    const imgSrc = getImageSrc();
    const currentPrice = Math.max(auction.startPrice, auction.highestBid || 0);
    
    // 실시간 현재가 업데이트를 위한 상태
    const [realTimePrice, setRealTimePrice] = useState(currentPrice);
    const [priceUpdated, setPriceUpdated] = useState(false);
    
    // 현재가가 변경될 때마다 실시간 가격 업데이트
    useEffect(() => {
      if (realTimePrice !== currentPrice) {
        setRealTimePrice(currentPrice);
        setPriceUpdated(true);
        setTimeout(() => setPriceUpdated(false), 500);
      }
    }, [currentPrice, realTimePrice]);

    return (
      <div className={`auction-card ${isFavorited ? 'favorited' : ''}`}>
        <div className="auction-image">
          <img src={imgSrc} alt={auction.title} />
          <div className="auction-category">{auction.category || '기타'}</div>
          {isFavorited && <div className="favorited-badge">❤️ 찜한 경매</div>}
          <FavoriteButton auctionId={auction.id} />
        </div>
        <Link to={`/auction/${auction.id}`} className="auction-content-link">
          <div className="auction-content">
            <h3 className="auction-title">{auction.title}</h3>
            <div className="auction-price">
              <span className="price-label">현재가</span>
              <span className={`price-value ${priceUpdated ? 'updated' : ''}`}>
                {realTimePrice.toLocaleString()}원
              </span>
            </div>
            <div className="auction-time">
              <span className="time-label">남은 시간</span>
              <TimeDisplay 
                startTime={auction.startAt || new Date().toISOString()}
                endTime={auction.endAt}
                mode="compact"
                className="time-value"
              />
            </div>
            <div className="auction-meta">
              <span className="bid-count">입찰 {auction.bidCount || 0}회</span>
              <span className="view-count">조회 {auction.viewCount || 0}회</span>
            </div>
            <div className="auction-link">
              입찰하러 가기 →
            </div>
          </div>
        </Link>
      </div>
    );
  };

  // 더 명확한 디버깅 로그 추가
  console.log('🚀 Home 컴포넌트 렌더링 시작');
  console.log('📊 전체 경매 수:', auctions.length);
  console.log('🔄 진행중인 경매 수:', activeAuctions.length);
  console.log('📋 마감된 경매 수:', auctions.length - activeAuctions.length);
  
  // 각 배열의 길이 확인
  console.log('📏 notices 길이:', dashboardData?.notices?.length || 0);
  console.log('📏 faqs 길이:', dashboardData?.faqs?.length || 0);
  console.log('📏 events 길이:', dashboardData?.events?.length || 0);
  console.log('📏 auctions 길이:', auctions?.length || 0);
  
  // 조건부 렌더링 조건 확인
  const noticesCondition = dashboardData?.notices && dashboardData.notices.length > 0;
  const faqsCondition = dashboardData?.faqs && dashboardData.faqs.length > 0;
  const eventsCondition = dashboardData?.events && dashboardData.events.length > 0;
  
  console.log('✅ 공지사항 표시 조건:', noticesCondition);
  console.log('✅ FAQ 표시 조건:', faqsCondition);
  console.log('✅ 이벤트 표시 조건:', eventsCondition);
  
  return (
    <div className="home-container">

      {/* 상단 경매 등록/전체보기 버튼 영역 */}
      <div className="auction-action-bar">
        <button
          className="auction-register-btn"
          onClick={() => navigate("/auction-new")}
        >
          경매 등록하기
        </button>
        <Link to="/auction" className="auction-all-link">
          전체 경매 보기
        </Link>
      </div>

      {/* 찜한 경매 섹션 */}
      {user && activeFavoritedAuctions.length > 0 && (
        <section className="favorited-auction-section">
          <div className="container">
            <div className="section-header">
              <h2>❤️ 내가 찜한 경매</h2>
              <Link to="/favorites" className="view-all-favorites">
                찜목록 전체보기 →
              </Link>
            </div>
            <div className="auction-grid">
              {activeFavoritedAuctions.slice(0, 4).map((auction) => (
                <AuctionCard key={auction.id} auction={auction} isFavorited={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 경매 섹션 */}
      <section className="auction-section">
        <div className="container">
          <div className="section-header">
            <h2>진행중인 경매</h2>
            <div className="category-filter">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="auction-grid">
            {filteredAuctions.length > 0 ? (
              selectedCategory === '전체' ? (
                <>
                  {filteredAuctions.slice(0, 8).map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))}
                </>
              ) : (
                filteredAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))
              )
            ) : (
              <div className="no-auctions">
                {selectedCategory === '전체' 
                  ? '현재 진행중인 경매가 없습니다.' 
                  : `현재 진행중인 ${selectedCategory} 카테고리 경매가 없습니다.`
                }
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 공지사항 */}
      {noticesCondition && (
        <section className="notice-section">
          <div className="container">
            <div className="section-header">
              <h2>공지사항</h2>
            </div>
            <div className="notice-list">
              {dashboardData.notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className={`notice-item ${notice.isImportant ? 'important' : ''}`}>
                  <div className="notice-content">
                    <h3 className="notice-title">
                      {notice.isImportant && <span className="important-badge">중요</span>}
                      {notice.title}
                    </h3>
                    <p className="notice-excerpt">{notice.content.substring(0, 50)}...</p>
                    <div className="notice-meta">
                      <span className="notice-date">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="notice-views">조회 {notice.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqsCondition && (
        <section className="faq-section">
          <div className="container">
            <div className="section-header">
              <h2>자주 묻는 질문</h2>
            </div>
            <div className="faq-list">
              {dashboardData.faqs.slice(0, 3).map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div className="faq-question">
                    <h3>{faq.question}</h3>
                    <p className="faq-answer">{faq.answer.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 이벤트 */}
      {eventsCondition && (
        <section className="event-section">
          <div className="container">
            <div className="section-header">
              <h2>진행중인 이벤트</h2>
            </div>
            <div className="event-list">
              {dashboardData.events.slice(0, 2).map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-content">
                    <h3 className="event-title">
                      {event.isImportant && <span className="important-badge">중요</span>}
                      {event.title}
                    </h3>
                    <p className="event-excerpt">{event.content.substring(0, 80)}...</p>
                    <div className="event-meta">
                      <span className="event-date">
                        {new Date(event.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
