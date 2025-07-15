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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAuctions(auctions);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredAuctions(
        auctions.filter(a =>
          (a.title && a.title.toLowerCase().includes(lower)) ||
          (a.category && a.category.toLowerCase().includes(lower)) ||
          (a.brand && a.brand.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, auctions]);

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
                  <AuctionTimeLeft startTime={auction.startTime} endTime={auction.endTime} />
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