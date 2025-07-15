import React, { useState, useEffect } from 'react';
import './LiveBidding.css';

const LiveBidding = ({ auctionId, currentPrice, minBidIncrement = 10000, onBidSubmit }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [autoBidAmount, setAutoBidAmount] = useState('');
  const [showAutoBid, setShowAutoBid] = useState(false);

  // 최소 입찰 금액 계산
  const minBid = currentPrice + minBidIncrement;
  
  // 빠른 입찰 금액 옵션들
  const quickBidOptions = [
    minBid,
    minBid + minBidIncrement,
    minBid + (minBidIncrement * 2),
    minBid + (minBidIncrement * 5)
  ];

  useEffect(() => {
    // 현재가가 변경되면 입찰 금액 초기화
    setBidAmount('');
    setAutoBidAmount('');
  }, [currentPrice]);

  const handleBidSubmit = async (amount) => {
    if (!amount || amount <= currentPrice) {
      showMessage('현재가보다 높은 금액을 입력해주세요.', 'error');
      return;
    }

    if (amount < minBid) {
      showMessage(`최소 입찰 금액은 ${formatPrice(minBid)}원입니다.`, 'error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // 실제 API 호출 대신 모의 처리
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 성공 시 콜백 호출
      if (onBidSubmit) {
        onBidSubmit({
          auctionId,
          bidAmount: amount,
          bidTime: new Date().toISOString()
        });
      }
      
      showMessage('입찰이 성공적으로 제출되었습니다!', 'success');
      setBidAmount('');
      
    } catch (error) {
      showMessage('입찰 제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (amount) => {
    setBidAmount(amount.toString());
    handleBidSubmit(amount);
  };

  const handleAutoBid = async () => {
    if (!autoBidAmount || autoBidAmount <= currentPrice) {
      showMessage('현재가보다 높은 자동입찰 금액을 설정해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('자동입찰이 설정되었습니다!', 'success');
      setShowAutoBid(false);
      setAutoBidAmount('');
    } catch (error) {
      showMessage('자동입찰 설정 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="live-bidding">
      <div className="bidding-header">
        <h3>💰 실시간 입찰</h3>
        <div className="current-price-display">
          <span className="price-label">현재가</span>
          <span className="price-value">{formatPrice(currentPrice)}원</span>
        </div>
      </div>

      {message && (
        <div className={`bidding-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="bidding-options">
        <div className="quick-bid-section">
          <h4>⚡ 빠른 입찰</h4>
          <div className="quick-bid-buttons">
            {quickBidOptions.map((amount, index) => (
              <button
                key={index}
                className="quick-bid-btn"
                onClick={() => handleQuickBid(amount)}
                disabled={isSubmitting}
              >
                {formatPrice(amount)}원
              </button>
            ))}
          </div>
        </div>

        <div className="custom-bid-section">
          <h4>✏️ 직접 입찰</h4>
          <div className="bid-input-group">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`최소 ${formatPrice(minBid)}원`}
              className="bid-input"
              disabled={isSubmitting}
            />
            <button
              className="bid-submit-btn"
              onClick={() => handleBidSubmit(parseInt(bidAmount))}
              disabled={isSubmitting || !bidAmount}
            >
              {isSubmitting ? '입찰 중...' : '입찰하기'}
            </button>
          </div>
        </div>

        <div className="auto-bid-section">
          <button
            className="auto-bid-toggle"
            onClick={() => setShowAutoBid(!showAutoBid)}
          >
            🤖 자동입찰 설정
          </button>
          
          {showAutoBid && (
            <div className="auto-bid-form">
              <div className="auto-bid-input-group">
                <input
                  type="number"
                  value={autoBidAmount}
                  onChange={(e) => setAutoBidAmount(e.target.value)}
                  placeholder="최대 입찰 금액"
                  className="auto-bid-input"
                  disabled={isSubmitting}
                />
                <button
                  className="auto-bid-submit-btn"
                  onClick={handleAutoBid}
                  disabled={isSubmitting || !autoBidAmount}
                >
                  {isSubmitting ? '설정 중...' : '설정하기'}
                </button>
              </div>
              <p className="auto-bid-info">
                자동입찰은 다른 입찰자가 입찰할 때 자동으로 최대 금액까지 입찰합니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bidding-info">
        <div className="info-item">
          <span className="info-label">최소 입찰 단위</span>
          <span className="info-value">{formatPrice(minBidIncrement)}원</span>
        </div>
        <div className="info-item">
          <span className="info-label">다음 최소 입찰가</span>
          <span className="info-value">{formatPrice(minBid)}원</span>
        </div>
      </div>

      <div className="bidding-tips">
        <h4>💡 입찰 팁</h4>
        <ul>
          <li>입찰 전 상품을 꼼꼼히 확인하세요</li>
          <li>경매 종료 시간을 미리 확인하세요</li>
          <li>자동입찰을 활용하면 편리합니다</li>
          <li>입찰 후에는 반드시 확인 메시지를 받으세요</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveBidding; 