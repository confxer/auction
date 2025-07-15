import React, { useState, useEffect } from 'react';
import './BidHistory.css';

const BidHistory = ({ auctionId, currentPrice, onBidUpdate }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBidHistory();
    
    // 실시간 업데이트를 위한 인터벌 설정
    const interval = setInterval(loadBidHistory, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }, [auctionId]);

  const loadBidHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/bids/auction/${auctionId}`);
      if (response.ok) {
        const bidData = await response.json();
        setBids(bidData);
        if (onBidUpdate && bidData.length > 0) {
          onBidUpdate(bidData[0]); // 최신 입찰 정보 전달
        }
      } else {
        // 실제 API가 없을 경우 모의 데이터 사용
        const mockBids = generateMockBids();
        setBids(mockBids);
      }
    } catch (err) {
      console.error('입찰 내역 로드 실패:', err);
      // 에러 시에도 모의 데이터 표시
      const mockBids = generateMockBids();
      setBids(mockBids);
    } finally {
      setLoading(false);
    }
  };

  const generateMockBids = () => {
    const mockBidders = ['김철수', '이영희', '박민수', '최지영', '정현우', '한소영'];
    const mockBids = [];
    
    let basePrice = currentPrice - 50000; // 시작가보다 낮은 가격부터
    
    for (let i = 0; i < 8; i++) {
      const bidAmount = basePrice + (i * 10000) + Math.floor(Math.random() * 5000);
      const bidTime = new Date();
      bidTime.setMinutes(bidTime.getMinutes() - (i * 2 + Math.floor(Math.random() * 10)));
      
      mockBids.push({
        id: i + 1,
        bidder: mockBidders[Math.floor(Math.random() * mockBidders.length)],
        bidAmount: bidAmount,
        bidTime: bidTime.toISOString(),
        isTopBid: i === 7 // 마지막 입찰이 최고가
      });
    }
    
    return mockBids.reverse(); // 최신순으로 정렬
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const getBidderInitial = (name) => {
    return name.charAt(0);
  };

  if (loading) {
    return (
      <div className="bid-history-loading">
        <div className="loading-spinner"></div>
        <p>입찰 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bid-history-error">
        <p>입찰 내역을 불러올 수 없습니다.</p>
        <button onClick={loadBidHistory} className="btn-retry">다시 시도</button>
      </div>
    );
  }

  return (
    <div className="bid-history">
      <div className="bid-history-header">
        <h3>📊 입찰 현황</h3>
        <span className="bid-count">총 {bids.length}건의 입찰</span>
      </div>
      
      {bids.length === 0 ? (
        <div className="no-bids">
          <div className="no-bids-icon">🏷️</div>
          <p>아직 입찰이 없습니다</p>
          <span>첫 번째 입찰자가 되어보세요!</span>
        </div>
      ) : (
        <div className="bid-list">
          {bids.map((bid, index) => (
            <div key={bid.id} className={`bid-item ${bid.isTopBid ? 'top-bid' : ''}`}>
              <div className="bid-rank">
                {index + 1}
              </div>
              <div className="bid-avatar">
                {getBidderInitial(bid.bidder)}
              </div>
              <div className="bid-info">
                <div className="bidder-name">
                  {bid.bidder}
                  {bid.isTopBid && <span className="top-bid-badge">🏆</span>}
                </div>
                <div className="bid-time">{formatTime(bid.bidTime)}</div>
              </div>
              <div className="bid-amount">
                {formatPrice(bid.bidAmount)}원
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bid-summary">
        <div className="summary-item">
          <span className="summary-label">현재 최고가</span>
          <span className="summary-value">
            {bids.length > 0 ? formatPrice(bids[0].bidAmount) : formatPrice(currentPrice)}원
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">입찰자 수</span>
          <span className="summary-value">
            {new Set(bids.map(bid => bid.bidder)).size}명
          </span>
        </div>
      </div>
    </div>
  );
};

export default BidHistory; 