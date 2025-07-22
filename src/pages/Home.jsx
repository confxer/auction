import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../style/HomeSection.css";
import axios from '../axiosConfig';
import useAuctionSocket from '../hooks/useAuctionSocket';
import FavoriteButton from '../components/FavoriteButton';
import TimeDisplay from '../components/TimeDisplay';
import { useUser } from '../UserContext';
import MainBanner from '../components/MainBanner';
import ReportPanel from '../components/admin/ReportPanel';

const Home = ({ dashboardData }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [auctions, setAuctions] = useState(dashboardData?.auctions || []);
  const [favoritedAuctions, setFavoritedAuctions] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showReport, setShowReport] = useState(false);

  
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
      console.log("dashboardData.auctions",dashboardData.auctions);
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
  const AuctionCard = ({ auction, isFavorited = false, closed = false }) => {
    
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
                closed={closed}
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
  
  // 공지/FAQ/이벤트 조건
  const notices = dashboardData?.notices?.slice(0, 3) || [];
  const faqs = dashboardData?.faqs?.slice(0, 3) || [];
  const events = dashboardData?.events?.slice(0, 2) || [];

  return (
    <div className="home-container">
      <MainBanner />

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
              {activeFavoritedAuctions
                .filter(auction => !auction.isClosed) // 종료된 경매는 제외
                .slice(0, 4)
                .map((auction) => (
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
                  {filteredAuctions.filter(auction => !auction.isClosed).slice(0, 8).map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} closed={auction.isClosed} />
                  ))}
                </>
              ) : (
                filteredAuctions.filter(auction => !auction.isClosed).map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} closed={auction.isClosed} />
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

      {/* 3등분 카드형 공지/FAQ/이벤트 */}
      <div className="home-section-row">
        {/* 공지사항 */}
        <div className="home-section-card">
          <div className="home-section-header">📢 공지사항
            <Link to="/notice" className="home-section-morebox">+</Link>
          </div>
          <div className="home-section-listbox">
            {notices.length > 0 ? notices.map(notice => (
              <div className="home-section-itembox" key={notice.id}>
                <span className="home-section-title">{notice.title}</span>
                <span className="home-section-date">{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            )) : <div className="home-section-itembox">공지사항이 없습니다.</div>}
          </div>
        </div>
        {/* FAQ */}
        <div className="home-section-card">
          <div className="home-section-header">❓ 자주 묻는 질문
            <Link to="/faq" className="home-section-morebox">+</Link>
          </div>
          <div className="home-section-listbox">
            {faqs.length > 0 ? faqs.map(faq => (
              <div className="home-section-itembox" key={faq.id}>
                <span className="home-section-title">{faq.question}</span>
              </div>
            )) : <div className="home-section-itembox">FAQ가 없습니다.</div>}
          </div>
        </div>
        {/* 이벤트 */}
        <div className="home-section-card">
          <div className="home-section-header">🎊 진행중인 이벤트
            <Link to="/event" className="home-section-morebox">+</Link>
          </div>
          <div className="home-section-listbox">
            {events.length > 0 ? events.map(event => (
              <div className="home-section-itembox" key={event.id}>
                <span className="home-section-title">{event.title}</span>
                <span className="home-section-date">{new Date(event.startDate).toLocaleDateString('ko-KR')}</span>
              </div>
            )) : <div className="home-section-itembox">이벤트가 없습니다.</div>}
          </div>
        </div>
      </div>

      {/* 이하 기존 경매/찜/카테고리 등 기존 홈 콘텐츠 유지 ... */}
      {/* 신고 내역 관리자 패널 (관리자만 노출) */}
      {user && user.role === 'ADMIN' && (
        <div style={{ marginTop: 40 }}>
          <h2>신고 내역(관리자용)</h2>
          <ReportPanel />
        </div>
      )}
    </div>
  );
};

export default Home;
