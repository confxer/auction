import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BidSection from '../components/BidSection';
import CommentSection from '../components/CommentSection';
import AuctionTimeLeft from '../components/AuctionTimeLeft';
import AuctionTimer from '../components/AuctionTimer';
import BidHistory from '../components/BidHistory';
import LiveBidding from '../components/LiveBidding';
import FavoriteButton from '../components/FavoriteButton';
import '../style/AuctionDetail.css';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBid, setCurrentBid] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState('진행중');
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    // "new" ID인 경우 경매 등록 페이지로 리다이렉트
    if (id === 'new') {
      navigate('/auction-new');
      return;
    }

    fetch(`/api/auctions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 오류');
        return res.json();
      })
      .then((data) => {
        setAuction(data);
        setCurrentPrice(Math.max(data.startPrice, data.highestBid || 0));
        setLoading(false);
        
        // 조회수 증가
        fetch(`/api/auctions/${id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.log('조회수 증가 실패:', err));
      })
      .catch((err) => {
        setAuction(null);
        setLoading(false);
      });
  }, [id, navigate]);

  // 실시간 현재가 업데이트를 위한 인터벌
  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      fetch(`/api/auctions/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const newPrice = Math.max(data.startPrice, data.highestBid || 0);
          setCurrentPrice(newPrice);
          setAuction(prev => ({ ...prev, ...data }));
        })
        .catch((err) => console.log('현재가 업데이트 실패:', err));
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, [auction, id]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/400x400?text=경매";
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };

  // 입찰 단위 계산 함수
  const getBidStep = (price) => {
    if (price >= 1000 && price <= 9999) return 1000;
    if (price >= 10000 && price <= 99999) return 5000;
    if (price >= 100000 && price <= 999999) return 10000;
    if (price >= 1000000 && price <= 9999999) return 50000;
    if (price >= 10000000) return 100000;
    return 1000;
  };

  // 최소 입찰 금액 계산
  const getMinBidAmount = () => {
    const currentHighest = Math.max(auction.startPrice, auction.highestBid || 0);
    const step = getBidStep(currentHighest);
    return currentHighest + step;
  };

  // 입찰 금액 검증
  const validateBidAmount = (amount) => {
    const numAmount = Number(amount);
    const minAmount = getMinBidAmount();
    const step = getBidStep(numAmount);

    if (numAmount < minAmount) {
      return `최소 입찰 금액은 ${formatPrice(minAmount)}원입니다.`;
    }

    if (numAmount % step !== 0) {
      return `입찰가는 ${formatPrice(step)}원 단위로만 가능합니다.`;
    }

    return null; // 검증 통과
  };

  // 실제 입찰하기 구현
  const handleBid = () => {
    const bidAmount = Number(currentBid);
    const validationError = validateBidAmount(bidAmount);
    
    if (validationError) {
      alert(validationError);
      return;
    }

    setProcessing(true);
    fetch(`http://localhost:8080/api/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auctionId: auction.id,
        bidAmount: bidAmount,
        bidder: 'guest' // 실제 로그인 사용자로 대체 가능
      }),
    })
      .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        return text;
      })
      .then(data => {
        alert('입찰 성공!');
        setShowBidModal(false);
        setCurrentBid('');
        setProcessing(false);
        
        // 현재가 즉시 업데이트
        const newPrice = Math.max(auction.startPrice, bidAmount);
        setCurrentPrice(newPrice);
        setAuction(prev => ({ ...prev, highestBid: bidAmount }));
      })
      .catch(err => {
        alert('입찰 실패: ' + err.message);
        setProcessing(false);
      });
  };

  // 실제 즉시구매 구현
  const handleBuyNow = async () => {
    await fetch(`/auctions/${auction.id}/buy-now`, {
      method: 'POST',
      credentials: 'include',
    });
    setAuctionStatus('종료');
  };

  if (loading) {
    return (
      <div className="auction-detail-loading">
        <div className="loading-spinner"></div>
        <p>경매 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="auction-detail-error">
        <h2>경매를 찾을 수 없습니다.</h2>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  // 이미지 배열 구성 - Auction 페이지와 동일하게
  const getImages = () => {
    if (!auction.imageUrl1) {
      return ['https://placehold.co/400x400?text=경매'];
    }
    return [auction.imageUrl1];
  };
  
  const images = getImages();
  const minBidAmount = isNaN(getMinBidAmount()) || getMinBidAmount() < 1000 ? 1000 : getMinBidAmount();
  const bidStep = isNaN(getBidStep(currentPrice)) || getBidStep(currentPrice) < 1000 ? 1000 : getBidStep(currentPrice);

  return (
    <div className="auction-detail">
      {/* 상단 정보 */}
      <div className="auction-header">
        <div className="auction-title-section">
          <h1>{auction.title}</h1>
          <div className="auction-seller-id" style={{fontSize:'0.98rem',color:'#888',marginTop:'4px',fontWeight:500}}>
            판매자: {auction.seller || auction.userId || '알수없음'}
          </div>
          <div className="auction-meta">
            <span className="category">{auction.category}</span>
            <span className="condition">{auction.status}</span>
            <span className="brand">{auction.brand}</span>
          </div>
        </div>
        <div className="auction-status">
          <div className="time-left">
            <AuctionTimer 
              endTime={auction.endAt} 
              onTimeUp={() => {
                setAuctionStatus('종료');
                console.log('경매 종료:', auction.id);
              }}
            />
          </div>
          <FavoriteButton auctionId={auction.id} />
        </div>
      </div>

      {/* 예정 안내 */}
      {auctionStatus === '예정' && (
        <div style={{color:'#888',fontWeight:600,fontSize:'1.1em',marginBottom:16}}>경매 예정중입니다. 시작 시간 이후에 참여하실 수 있습니다.</div>
      )}

      <div className="auction-content">
        {/* 이미지 갤러리 */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={getImageUrl(images[0])} alt={auction.title} />
          </div>
          <div className="thumbnail-list">
            {images.map((image, index) => (
              <div key={index} className="thumbnail">
                <img src={getImageUrl(image)} alt={`${auction.title} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* 입찰 섹션 */}
        <div className="bidding-section">
          <div className="current-price-display">
            <h3>현재가</h3>
            <div className="price-amount">{formatPrice(currentPrice)}원</div>
            <div className="price-info">
              <span>최소 입찰가: {formatPrice(minBidAmount)}원</span>
              <span>입찰 단위: {formatPrice(bidStep)}원</span>
            </div>
          </div>
          
          <div className="bidding-actions">
            <button 
              className="bid-button"
              onClick={() => setShowBidModal(true)}
              disabled={auctionStatus === '종료'}
            >
              입찰하기
            </button>
            
            {auction.buyNowPrice && (
              <button 
                className="buy-now-button"
                onClick={() => setShowBuyNowModal(true)}
                disabled={auctionStatus === '종료'}
              >
                즉시구매 ({formatPrice(auction.buyNowPrice)}원)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 입찰 현황 및 상품 정보 */}
      <div className="auction-details-grid">
        <div className="bid-history-section">
          <BidHistory 
            auctionId={auction.id}
            currentPrice={currentPrice}
            onBidUpdate={(latestBid) => {
              console.log('최신 입찰:', latestBid);
            }}
          />
        </div>

        <div className="product-info-section">
          <div className="auction-info-summary">
            <h3>경매 정보</h3>
            <div className="info-item">
              <span className="info-label">시작가</span>
              <span className="info-value">{formatPrice(auction.startPrice)}원</span>
            </div>
            <div className="info-item">
              <span className="info-label">현재가</span>
              <span className="info-value">{formatPrice(currentPrice)}원</span>
            </div>
            <div className="info-item">
              <span className="info-label">최소 입찰 단위</span>
              <span className="info-value">{formatPrice(bidStep)}원</span>
            </div>
            {auction.buyNowPrice && (
              <div className="info-item">
                <span className="info-label">즉시구매가</span>
                <span className="info-value">{formatPrice(auction.buyNowPrice)}원</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="product-info">
        <h2>상품 정보</h2>
        <div className="info-grid">
          <div className="description">
            <h3>상품 설명</h3>
            <p>{auction.description}</p>
          </div>
          <div className="specifications">
            <h3>제품 사양</h3>
            <div className="spec-list">
              <div className="spec-item">
                <span className="spec-label">브랜드</span>
                <span className="spec-value">{auction.brand}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">상태</span>
                <span className="spec-value">{auction.status}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">카테고리</span>
                <span className="spec-value">{auction.category}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">등록일</span>
                <span className="spec-value">{auction.createdAt?.split('T')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 판매자 정보 */}
      <div className="seller-info">
        <h2>판매자 정보</h2>
        <div className="seller-card">
          <div className="seller-header">
            <div className="seller-name">아이디: {auction.seller || auction.userId || '알수없음'}</div>
          </div>
        </div>
      </div>

      {/* 배송 및 반품 정보 */}
      <div className="shipping-info">
        <h2>배송 및 반품</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>배송 정보</h3>
            <p>배송비: {auction.shippingFee || '무료'}</p>
            <p>배송 방법: {auction.shippingType}</p>
            <p>배송 지역: {auction.location}</p>
          </div>
        </div>
      </div>

      {/* 댓글 */}
      <CommentSection auctionId={auction.id} />

      {/* 입찰 모달 */}
      {showBidModal && (
        <div className="modal-overlay" onClick={() => setShowBidModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>입찰하기</h3>
            <div className="bid-form">
              <div className="current-price-info">
                <p>현재가: <strong>{formatPrice(currentPrice)}원</strong></p>
                <p>최소 입찰가: <strong>{formatPrice(minBidAmount)}원</strong></p>
              </div>
              <label>입찰 금액</label>
              <input
                type="number"
                value={currentBid}
                onChange={(e) => setCurrentBid(e.target.value)}
                placeholder={`최소 ${formatPrice(minBidAmount)}원`}
                min={minBidAmount}
                step={bidStep}
                disabled={processing}
                style={{display: 'block'}}
                autoFocus
              />
              <div className="bid-validation">
                {currentBid && validateBidAmount(currentBid) && (
                  <div className="validation-error">
                    {validateBidAmount(currentBid)}
                  </div>
                )}
                <div className="bid-step-info">
                  입찰 단위: {formatPrice(bidStep)}원 단위
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowBidModal(false)} className="btn-cancel" disabled={processing}>취소</button>
                <button 
                  onClick={handleBid} 
                  className="btn-confirm" 
                  disabled={processing || (currentBid && validateBidAmount(currentBid))}
                >
                  입찰하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 즉시구매 모달 */}
      {showBuyNowModal && (
        <div className="modal-overlay" onClick={() => setShowBuyNowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>즉시구매</h3>
            <div className="buy-now-form">
              <div className="buy-now-info">
                <p>즉시구매가: <strong>{formatPrice(auction.buyNowPrice)}원</strong></p>
                <p>현재가: {formatPrice(currentPrice)}원</p>
                <p>이 금액으로 즉시 구매하시겠습니까?</p>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowBuyNowModal(false)} className="btn-cancel" disabled={processing}>취소</button>
                <button onClick={handleBuyNow} className="btn-confirm" disabled={processing}>구매하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
