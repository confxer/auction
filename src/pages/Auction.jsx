import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuctionTimeLeft from '../components/AuctionTimeLeft';
import '../style/Auction.css';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';

const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('전체');

  const { user } = useUser();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/auctions');
        console.log(res);
        if (res.status != 200) throw new Error('서버 응답 오류');
        setAuctions(res.data);

        // ✅ 현재가 시드: 시작가 vs highestBid
        const seed = (data || []).reduce((acc, a) => {
          const start = Number(a.startPrice || 0);
          const highest = Number(a.highestBid || 0);
          acc[a.id] = Math.max(start, highest);
          return acc;
        }, {});
        setCurrentPrices(seed);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('경매 데이터를 불러올 수 없습니다.');
        setLoading(false);
      }
    })();
  }, []);

  // 각 경매의 현재가를 입찰목록으로부터 계산해서 갱신
  const refreshCurrentPrices = async (list) => {
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
        results.forEach(({ id, price }) => { next[id] = price; });
        return next;
      });
    } catch (e) {
      console.warn('현재가 동기화 실패:', e);
    }
  };

  // 경매가 로드되면 현재가 동기화 1회 + 주기적 동기화
  useEffect(() => {
    if (!auctions || auctions.length === 0) return;
    refreshCurrentPrices(auctions);
    const t = setInterval(() => refreshCurrentPrices(auctions), 15000);
    return () => clearInterval(t);
  }, [auctions]);

  // 정렬 및 필터링
  const getSortedAuctions = (list, search, category) => {
    const now = new Date();

    const ended = list.filter(a => a.isClosed || (a.endAt && new Date(a.endAt) <= now));
    const ongoing = list.filter(a =>
      !a.isClosed && a.startAt && a.endAt &&
      new Date(a.startAt) <= now && new Date(a.endAt) > now
    );
    const upcoming = list.filter(a => !a.isClosed && a.startAt && new Date(a.startAt) > now);

    ongoing.sort((a, b) => new Date(a.endAt) - new Date(b.endAt));
    upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    ended.sort((a, b) => new Date(b.endAt) - new Date(a.endAt));

    let sorted = [...ongoing, ...upcoming, ...ended];

    if (category !== '전체') {
      sorted = sorted.filter(a => a.category === category);
    }

    if (search) {
      const lower = search.toLowerCase();
      sorted = sorted.filter(a =>
        (a.title && a.title.toLowerCase().includes(lower)) ||
        (a.category && a.category.toLowerCase().includes(lower)) ||
        (a.brand && a.brand.toLowerCase().includes(lower))
      );
    }

    return sorted;
  };

  useEffect(() => {
    const sorted = getSortedAuctions(auctions, searchTerm, categoryFilter);
    setFilteredAuctions(sorted);
  }, [auctions, searchTerm, categoryFilter]);

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/200x200?text=경매';
    if (url.startsWith('/uploads/')) return `/api${url}`;
    return url;
  };

  const handleEnd = (id, isClosed) => {
    console.log('마감된 경매 ID:', id, isClosed);
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('정말 이 경매와 모든 댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/auctions/${auctionId}`);
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      setCurrentPrices(prev => {
        const { [auctionId]: _, ...rest } = prev;
        return rest;
      });
      alert('경매와 모든 댓글이 삭제되었습니다.');
    } catch {
      alert('경매 삭제에 실패했습니다.');
    }
  };

  // 현재가: currentPrices 우선, 없으면 시작가/최고가 폴백
  const getCurrentPrice = (a) => {
    const cp = currentPrices[a.id];
    if (typeof cp === 'number') return cp;
    return Math.max(Number(a.startPrice || 0), Number(a.highestBid || 0));
  };

  return (
    <div className="auction-list-page">
      <div className="auction-list-header-with-search">
        <h1>전체 경매 리스트</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <form className="auction-search" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder="찾고 싶은 경매 물품을 검색하세요"
              className="auction-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="auction-search-btn">🔍</button>
          </form>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ height: 32 }}
          >
            <option value="전체">전체</option>
            <option value="가전">가전</option>
            <option value="전자제품">전자제품</option>
            <option value="패션">패션</option>
            <option value="명품">명품</option>
            <option value="도서">도서</option>
            <option value="취미">취미</option>
            <option value="스포츠">스포츠</option>
          </select>
        </div>
      </div>

      <div className="auction-card-grid">
        {loading ? (
          <div className="auction-list-loading">
            <div className="loading-spinner"></div>
            <p>경매 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="auction-list-error">
            <p>{error}</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="auction-list-empty">검색 결과가 없습니다.</div>
        ) : (
          filteredAuctions.map((a) => {
            const price = getCurrentPrice(a);
            const start = Number(a.startPrice || 0);

            // ✅ "시작가" 배지 표시 기준: 현재가 === 시작가
            const showStartTag = (typeof currentPrices[a.id] === 'number')
              ? price <= start
              : !(a.highestBid && a.highestBid > 0); // 초기 폴백

            return (
              <Link to={`/auction/${a.id}`} key={a.id} className="auction-card">
                <div className="auction-card-image">
                  <img
                    src={getImageUrl(a.imageUrl1)}
                    alt={a.title}
                    loading="lazy"
                  />
                  <div className="auction-card-time">
                    <AuctionTimeLeft
                      startTime={a.startAt || a.startTime}
                      endTime={a.endAt || a.endTime}
                      isClosed={a.isClosed}
                      fnc={() => handleEnd(a.id, a.isClosed)}
                      id={a.id}
                    />
                  </div>
                </div>
                <div className="auction-card-info">
                  <div className="auction-card-title" title={a.title}>
                    {a.title}
                  </div>
                  <div className="auction-card-price">
                    <span className="price">
                      {formatPrice(price)}
                      <span className="won">원</span>
                      {showStartTag && (
                        <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>시작가</span>
                      )}
                    </span>
                  </div>
                  <div className="auction-card-meta">
                    <span className="brand">{a.brand}</span>
                    <span className="category">{a.category}</span>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button
                      className="auction-delete-btn"
                      onClick={e => {
                        e.preventDefault();
                        handleDeleteAuction(a.id);
                      }}
                      style={{
                        marginTop: 8,
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Auction;
