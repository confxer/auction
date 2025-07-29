import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuctionTimeLeft from '../components/AuctionTimeLeft';
import '../style/Auction.css';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';

const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('전체');

  const { user } = useUser();

  // 데이터 불러오기
  useEffect(() => {
    fetch("/api/auctions")
      .then(res => {
        if (!res.ok) throw new Error("서버 응답 오류");
        return res.json();
      })
      .then(data => {
        setAuctions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("경매 데이터를 불러올 수 없습니다.");
        setLoading(false);
      });
  }, []);

  // 경매 상태 종료 시 콜백
  const handleEnd = (id) => {
    console.log("마감된 경매 ID:", id);
  };

  // 정렬 및 필터링 함수
  const getSortedAuctions = (auctions, searchTerm, categoryFilter) => {
    const now = new Date();

    const ended = auctions.filter(
      a => a.isClosed || (a.endAt && new Date(a.endAt) <= now)
    );

    const ongoing = auctions.filter(
      a =>
        !a.isClosed &&
        a.startAt &&
        a.endAt &&
        new Date(a.startAt) <= now &&
        new Date(a.endAt) > now
    );

    const upcoming = auctions.filter(
      a =>
        !a.isClosed &&
        a.startAt &&
        new Date(a.startAt) > now
    );

    ongoing.sort((a, b) => new Date(a.endAt) - new Date(b.endAt));
    upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    ended.sort((a, b) => new Date(b.endAt) - new Date(a.endAt));

    let sorted = [...ongoing, ...upcoming, ...ended];

    // 카테고리 필터
    if (categoryFilter !== '전체') {
      sorted = sorted.filter(a => a.category === categoryFilter);
    }

    // 검색 필터
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
    const sorted = getSortedAuctions(auctions, searchTerm, categoryFilter);
    setFilteredAuctions(sorted);
  }, [auctions, searchTerm, categoryFilter]);

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/200x200?text=경매";
    if (url.startsWith('/uploads/')) return `/api${url}`;
    return url;
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('정말 이 경매와 모든 댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/auctions/${auctionId}`);
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      alert('경매와 모든 댓글이 삭제되었습니다.');
    } catch {
      alert('경매 삭제에 실패했습니다.');
    }
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
          filteredAuctions.map((auction) => (
            <Link to={`/auction/${auction.id}`} key={auction.id} className="auction-card">
              <div className="auction-card-image">
                <img
                  src={getImageUrl(auction.imageUrl1)}
                  alt={auction.title}
                />
                <div className="auction-card-time">
                  <AuctionTimeLeft
                    startTime={auction.startTime}
                    endTime={auction.endTime}
                    isClosed={auction.isClosed} // ✅ 수정됨
                    fnc={() => handleEnd(auction.id)}
                    id={auction.id}
                  />
                </div>
              </div>
              <div className="auction-card-info">
                <div className="auction-card-title" title={auction.title}>
                  {auction.title}
                </div>
                <div className="auction-card-price">
                  <span className="price">
                    {formatPrice(
                      auction.highestBid && auction.highestBid > 0
                        ? auction.highestBid
                        : auction.startPrice
                    )}
                    <span className="won">원</span>
                    {!auction.highestBid && (
                      <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>시작가</span>
                    )}
                  </span>
                </div>
                <div className="auction-card-meta">
                  <span className="brand">{auction.brand}</span>
                  <span className="category">{auction.category}</span>
                </div>
                {user?.role === 'ADMIN' && (
                  <button
                    className="auction-delete-btn"
                    onClick={e => {
                      e.preventDefault();
                      handleDeleteAuction(auction.id);
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
          ))
        )}
      </div>
    </div>
  );
};

export default Auction;
