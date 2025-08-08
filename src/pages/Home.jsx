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
import KakaoMap from './KakaoMap';

// 🔧 서버/소켓에서 오는 다양한 필드명을 하나로 정규화
const normalizeAuction = (a = {}) => {
  const id = Number(a.id ?? a.auctionId);
  const highestBid =
    a.highestBid ?? a.currentPrice ?? a.price ?? a.highest_bid ?? 0;
  const bidCount = a.bidCount ?? a.bids ?? a.bid_count ?? 0;
  const viewCount = a.viewCount ?? a.views ?? a.view_count ?? 0;
  const isClosed = Boolean(a.isClosed ?? a.closed ?? a.status === 'CLOSED');

  return {
    ...a,
    id, // 숫자 통일
    highestBid: Number(highestBid),
    bidCount: Number(bidCount),
    viewCount: Number(viewCount),
    isClosed,
  };
};

const Home = ({ dashboardData }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [auctions, setAuctions] = useState(
    (dashboardData?.auctions || []).map(normalizeAuction)
  );
  const [currentPrices, setCurrentPrices] = useState({}); // ✅ id -> 현재가
  const [favoritedAuctions, setFavoritedAuctions] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // ✅ 현재가 시드: 시작가 vs highestBid
  const seedCurrentPrices = useCallback((list) => {
    const seed = (list || []).reduce((acc, a) => {
      const start = Number(a.startPrice || 0);
      const highest = Number(a.highestBid || 0);
      acc[a.id] = Math.max(start, highest);
      return acc;
    }, {});
    setCurrentPrices(prev => ({ ...seed, ...prev })); // 기존 값 보존
  }, []);

  // 실시간 경매 업데이트 콜백: id/필드 정규화 + 안전 머지 + 현재가 반영
  const handleAuctionUpdate = useCallback((raw) => {
    const updatedAuction = normalizeAuction(raw);

    setAuctions(prev => {
      let found = false;
      const next = prev.map(a => {
        if (Number(a.id) === updatedAuction.id) {
          found = true;
          const safePatch = Object.fromEntries(
            Object.entries(updatedAuction).filter(([_, v]) => v !== undefined)
          );
          return { ...a, ...safePatch };
        }
        return a;
      });
      // 목록에 없던 경매가 실시간으로 들어오면 앞에 추가
      const merged = found ? next : [updatedAuction, ...next];

      // ✅ 현재가도 즉시 반영(웹소켓 수신 값 기준)
      const start = Number(updatedAuction.startPrice ?? merged.find(x => x.id === updatedAuction.id)?.startPrice ?? 0);
      const highest = Number(updatedAuction.highestBid ?? 0);
      const nowPrice = Math.max(start, highest);
      setCurrentPrices(prev => ({
        ...prev,
        [updatedAuction.id]: Math.max(nowPrice, prev[updatedAuction.id] ?? 0) // 낮아지는 경우 방지
      }));

      return merged;
    });
  }, []);

  // 즉시구매/시간만료 등 타이머 종료콜백(로그 위치)
  const handleEnd = (id) => {
    console.log('⏳ Time up for auction id:', id);
    // 필요 시 여기서 isClosed=true 패치
  };

  // WebSocket 연결
  useAuctionSocket(handleAuctionUpdate);

  // dashboardData가 변경될 때 auctions 상태 동기화 + 현재가 시드
  useEffect(() => {
    if (dashboardData?.auctions) {
      const norm = dashboardData.auctions.map(normalizeAuction);
      setAuctions(norm);
      seedCurrentPrices(norm);
      console.log("dashboardData.auctions", dashboardData.auctions);
    }
  }, [dashboardData?.auctions, seedCurrentPrices]);

  // 찜한 경매 목록 로드
  useEffect(() => {
    if (user) {
      loadFavoritedAuctions();
    }
    // auctions가 바뀌면 찜 목록도 다시 매칭 필요 → deps에 auctions 포함
  }, [user, auctions]);

  const loadFavoritedAuctions = async () => {
    if (!user) return;
    try {
      setLoadingFavorites(true);
      const response = await axios.get(`/api/favorites/user/${user.id}`);
      const favorites = response.data || [];
      const favoritedIds = favorites.map(fav => Number(fav.auctionId));
      const favorited = auctions.filter(auction => favoritedIds.includes(Number(auction.id)));
      setFavoritedAuctions(favorited);
    } catch (error) {
      console.error('찜한 경매 로드 실패:', error);
      setFavoritedAuctions([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // ✅ 입찰목록에서 현재가 계산해서 갱신
  const refreshCurrentPrices = useCallback(async (list) => {
    try {
      const promises = list.map(async (a) => {
        try {
          const res = await axios.get(`/api/bids/auction/${a.id}`);
          const bids = Array.isArray(res.data) ? res.data : [];
          const maxBid = bids.length ? Math.max(...bids.map(b => Number(b.bidAmount || 0))) : 0;
          const current = Math.max(Number(a.startPrice || 0), maxBid);
          return { id: a.id, price: current };
        } catch {
          return { id: a.id, price: Number(a.startPrice || 0) };
        }
      });

      const results = await Promise.all(promises);
      setCurrentPrices(prev => {
        const next = { ...prev };
        results.forEach(({ id, price }) => {
          next[id] = Math.max(price, prev[id] ?? 0); // 숫자 내려가는 거 방지(옵션)
        });
        return next;
      });
    } catch (e) {
      console.warn('현재가 동기화 실패:', e);
    }
  }, []);

  // 경매가 로드되면 현재가 동기화 1회 + 주기적 동기화
  useEffect(() => {
    if (!auctions || auctions.length === 0) return;
    // 초기 폴링 직전에도 한 번 더 확정
    refreshCurrentPrices(auctions);
    const t = setInterval(() => refreshCurrentPrices(auctions), 15000);
    return () => clearInterval(t);
  }, [auctions, refreshCurrentPrices]);

  // 카테고리 목록
  const categories = ['전체', '가전', '전자제품', '패션', '명품', '도서', '취미', '스포츠'];

  // 진행중(마감되지 않은) 필터
  const activeAuctions = auctions.filter(auction => {
    if (auction.isClosed) return false;
    if (!auction.endAt) return false;
    const now = Date.now();
    const end = new Date(auction.endAt).getTime();
    return end > now;
  });

  // 진행중 + 찜
  const activeFavoritedAuctions = favoritedAuctions.filter(auction => {
    if (auction.isClosed) return false;
    if (!auction.endAt) return false;
    const now = Date.now();
    const end = new Date(auction.endAt).getTime();
    return end > now;
  });

  // 카테고리 필터
  const filteredAuctions = selectedCategory === '전체'
    ? activeAuctions
    : activeAuctions.filter(auction => auction.category === selectedCategory);

  // 경매 카드(React.memo로 불필요 렌더 절감)
  const AuctionCard = React.memo(function AuctionCard({ auction, isFavorited = false, closed = false, currentPrice }) {
    const getImageSrc = () => {
      if (!auction.imageUrl1) return "https://placehold.co/300x200?text=No+Image";
      if (String(auction.imageUrl1).startsWith('/uploads/')) {
        return `/api${auction.imageUrl1}`;
      }
      return auction.imageUrl1;
    };
    const imgSrc = getImageSrc();

    // ✅ currentPrice prop 우선, 없으면 폴백
    const shownPrice = typeof currentPrice === 'number'
      ? currentPrice
      : Math.max(Number(auction.startPrice || 0), Number(auction.highestBid || 0));

    return (
      <div className={`auction-card ${isFavorited ? 'favorited' : ''}`}>
        <div className="auction-image">
          <img src={imgSrc} alt={auction.title} loading="lazy" />
          <div className="auction-category">{auction.category || '기타'}</div>
          {isFavorited && <div className="favorited-badge">❤️ 찜한 경매</div>}
          <FavoriteButton auctionId={auction.id} />
        </div>
        <Link to={`/auction/${auction.id}`} className="auction-content-link">
          <div className="auction-content">
            <h3 className="auction-title">{auction.title}</h3>
            <div className="auction-price">
              <span className="price-label">현재가</span>
              <span className="price-value">
                {shownPrice.toLocaleString()}원
              </span>
            </div>
            <div className="auction-time">
              <span className="time-label">남은 시간</span>
              <TimeDisplay
                startTime={auction.startAt || new Date().toISOString()}
                endTime={auction.endAt}
                mode="compact"
                className="time-value"
                id={auction.id}
                onTimeUp={() => handleEnd(auction.id)}
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
  });

  // 디버깅 로그
  console.log('🚀 Home 렌더 / auctions:', auctions.length, 'currentPrices keys:', Object.keys(currentPrices).length);

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
                .filter(auction => !auction.isClosed)
                .slice(0, 4)
                .map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    isFavorited={true}
                    closed={auction.isClosed}
                    currentPrice={currentPrices[auction.id]} // ✅ 현재가 주입
                  />
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
              {['전체', '가전', '전자제품', '패션', '명품', '도서', '취미', '스포츠'].map(category => (
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
                  {filteredAuctions
                    .filter(auction => !auction.isClosed)
                    .slice(0, 8)
                    .map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        auction={auction}
                        closed={auction.isClosed}
                        currentPrice={currentPrices[auction.id]} // ✅ 현재가 주입
                      />
                    ))}
                </>
              ) : (
                filteredAuctions
                  .filter(auction => !auction.isClosed)
                  .map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      closed={auction.isClosed}
                      currentPrice={currentPrices[auction.id]} // ✅ 현재가 주입
                    />
                  ))
              )
            ) : (
              <div className="no-auctions">
                {selectedCategory === '전체'
                  ? '현재 진행중인 경매가 없습니다.'
                  : `현재 진행중인 ${selectedCategory} 카테고리 경매가 없습니다.`}
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

      {/* KakaoMap: 홈 하단에 지도 표시 */}
      <div style={{ margin: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>오시는 길</h2>
          <a
            href="https://map.kakao.com/link/to/단성사,37.5709,126.9923"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#fee500',
              color: '#181600',
              fontWeight: 700,
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              transition: 'background 0.2s',
            }}
          >
            카카오맵 길찾기
          </a>
        </div>
        <KakaoMap />
      </div>

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
