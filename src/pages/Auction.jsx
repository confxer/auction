import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuctionTimeLeft from '../components/AuctionTimeLeft';
import '../style/Auction.css';

const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('전체');

  useEffect(() => {
    fetch("/api/auctions")
      .then((res) => {
        if (!res.ok) throw new Error("서버 응답 오류");
        return res.json();
      })
      .then((data) => {
        setAuctions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("경매 데이터를 불러올 수 없습니다.");
        setLoading(false);
      });
  }, []);

  // 정렬 및 필터링 함수
  const getSortedAuctions = (auctions, searchTerm, categoryFilter) => {
    const now = new Date();
    // 진행중: 시작됨~마감전
    const ongoing = auctions.filter(a => new Date(a.startTime) <= now && new Date(a.endTime) > now);
    // 예정: 시작 전
    const upcoming = auctions.filter(a => new Date(a.startTime) > now);
    // 마감: 종료
    const ended = auctions.filter(a => new Date(a.endTime) <= now);

    // 정렬
    ongoing.sort((a, b) => new Date(a.endTime) - new Date(b.endTime)); // 남은시간 적은 순
    upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // 시작일 빠른 순
    ended.sort((a, b) => new Date(b.endTime) - new Date(a.endTime)); // 종료일 늦은 순

    let sorted = [...ongoing, ...upcoming, ...ended];

    // 카테고리 필터
    if (categoryFilter && categoryFilter !== '전체') {
      sorted = sorted.filter(a => a.category === categoryFilter);
    }
    // 검색어 필터
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      sorted = sorted.filter(a =>
        (a.title && a.title.toLowerCase().includes(lower)) ||
        (a.category && a.category.toLowerCase().includes(lower)) ||
        (a.brand && a.brand.toLowerCase().includes(lower))
      );
    }
    return sorted;
  };

  useEffect(() => {
    setFilteredAuctions(getSortedAuctions(auctions, searchTerm, categoryFilter));
  }, [auctions, searchTerm, categoryFilter]);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getImageUrl = (imageUrl1) => {
    if (!imageUrl1) return "https://placehold.co/200x200?text=경매";
    if (imageUrl1.startsWith('/uploads/')) {
      return `/api${imageUrl1}`;
    }
    return imageUrl1;
  };

  return (
    <div className="auction-list-page">
      <div className="auction-list-header-with-search">
        <h1>전체 경매 리스트</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <form className="auction-search" onSubmit={e => { e.preventDefault(); }}>
            <input
              type="text"
              placeholder="찾고 싶은 경매 물품을 검색하세요"
              className="auction-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="auction-search-btn">🔍</button>
          </form>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ height: 32 }}>
            <option value="전체">전체</option>
            <option value="가전">가전</option>
            <option value="전자제품">전자제품</option>
            <option value="패션">패션</option>
            <option value="명품">명품</option>
            <option value="도서">도서</option>
            <option value="취미">취미</option>
            <option value="스포츠">스포츠</option>
            {/* 필요시 카테고리 추가 */}
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
          filteredAuctions.map((auction) => (
            <Link to={`/auction/${auction.id}`} key={auction.id} className="auction-card">
              <div className="auction-card-image">
                <img
                  src={getImageUrl(auction.imageUrl1)}
                  alt={auction.title}
                />
                <div className="auction-card-time">
                  <AuctionTimeLeft startTime={auction.startTime} endTime={auction.endTime} ended = {auction.isClosed} />
                </div>
              </div>
              <div className="auction-card-info">
                <div className="auction-card-title" title={auction.title}>
                  {auction.title}
                </div>
                <div className="auction-card-price">
                  <span className="price">{formatPrice(auction.highestBid)}<span className="won">원</span></span>
                </div>
                <div className="auction-card-meta">
                  <span className="brand">{auction.brand}</span>
                  <span className="category">{auction.category}</span>
                </div>
                <div className="auction-card-status">
                  {/* 상태는 AuctionTimeLeft에서 표시됨 */}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Auction; 