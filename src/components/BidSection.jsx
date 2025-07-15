import React, { useState, useEffect } from 'react';
import './BidSection.css';

const BidSection = ({ auctionId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBidHistory();
  }, [auctionId]);

  const loadBidHistory = () => {
    // 임시 입찰 데이터
    const mockBids = [
      {
        id: 1,
        userId: "user123",
        username: "경매왕",
        amount: 2500000,
        timestamp: "2024-01-10T15:30:00",
        isWinner: false
      },
      {
        id: 2,
        userId: "user456",
        username: "스마트쇼퍼",
        amount: 2400000,
        timestamp: "2024-01-10T14:45:00",
        isWinner: false
      },
      {
        id: 3,
        userId: "user789",
        username: "디지털러버",
        amount: 2300000,
        timestamp: "2024-01-10T14:20:00",
        isWinner: false
      },
      {
        id: 4,
        userId: "user101",
        username: "테크마스터",
        amount: 2200000,
        timestamp: "2024-01-10T13:55:00",
        isWinner: false
      },
      {
        id: 5,
        userId: "user202",
        username: "애플팬",
        amount: 2100000,
        timestamp: "2024-01-10T13:30:00",
        isWinner: false
      },
      {
        id: 6,
        userId: "user303",
        username: "첫입찰러",
        amount: 2000000,
        timestamp: "2024-01-10T13:00:00",
        isWinner: false
      }
    ];

    setBids(mockBids);
    setLoading(false);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBidStatus = (bid, index) => {
    if (index === 0) return 'current';
    if (index === 1) return 'outbid';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="bid-section-loading">
        <div className="loading-spinner"></div>
        <p>입찰 내역을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bid-section">
      <div className="bid-header">
        <h2>입찰 내역</h2>
        <span className="bid-count">총 {bids.length}건</span>
      </div>

      {bids.length === 0 ? (
        <div className="no-bids">
          <div className="no-bids-icon">🏷️</div>
          <p>아직 입찰이 없습니다.</p>
          <span>첫 번째 입찰자가 되어보세요!</span>
        </div>
      ) : (
        <div className="bid-list">
          {bids.map((bid, index) => (
            <div 
              key={bid.id} 
              className={`bid-item ${getBidStatus(bid, index)}`}
            >
              <div className="bid-rank">
                {index === 0 && <span className="rank-badge current">현재 최고가</span>}
                {index === 1 && <span className="rank-badge outbid">아웃비드</span>}
                {index > 1 && <span className="rank-number">{index + 1}</span>}
              </div>
              
              <div className="bid-info">
                <div className="bid-user">
                  <span className="username">{bid.username}</span>
                  {bid.isWinner && <span className="winner-badge">🏆</span>}
                </div>
                <div className="bid-amount">
                  {formatPrice(bid.amount)}원
                </div>
              </div>
              
              <div className="bid-time">
                {formatTime(bid.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bid-summary">
        <div className="summary-item">
          <span className="summary-label">현재 최고가</span>
          <span className="summary-value current">
            {bids.length > 0 ? formatPrice(bids[0].amount) : '0'}원
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">총 입찰 수</span>
          <span className="summary-value">{bids.length}회</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">최소 입찰 단위</span>
          <span className="summary-value">10,000원</span>
        </div>
      </div>

      <div className="bid-notice">
        <h3>입찰 안내</h3>
        <ul>
          <li>현재가보다 높은 금액으로만 입찰 가능합니다.</li>
          <li>최소 입찰 단위는 10,000원입니다.</li>
          <li>입찰 후에는 취소할 수 없습니다.</li>
          <li>경매 마감 시 최고가 입찰자가 낙찰됩니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default BidSection;
