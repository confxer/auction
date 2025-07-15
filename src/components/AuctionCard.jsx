import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

function AuctionCard({ auction, onToggleFavorite }) {
  if (!auction) return null;

  const {
    id = 0,
    title = '제목 없음',
    startPrice = 0,
    highestBid = 0,
    endAt,
    imageBase64,
    bidCount = 0,
    viewCount = 0,
    seller = '',
    isFavorited = false,
  } = auction;

  const imgSrc = imageBase64 || 'https://placehold.co/200x120?text=No+Image';

  // 남은 시간(초) 상태
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!endAt) return 0;
    const diff = new Date(endAt).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  });

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timerId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [remainingSeconds]);

  const formatRemainingTime = (seconds) => {
    if (seconds <= 0) return '종료됨';
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `종료 ${days}일 ${hrs}시간`;
    if (hrs > 0) return `종료 ${hrs}시간 ${mins}분`;
    return `종료 ${mins}분`;
  };

  return (
    <div className="auction-card" style={{ minWidth: 0, padding: 0, border: '1px solid #ececec', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="auction-image" style={{ width: '100%', height: 120, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt="썸네일"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/200x120?text=No+Image';
          }}
        />
      </div>
      <div className="auction-content" style={{ padding: '10px 10px 12px 10px' }}>
        <div className="current-price" style={{ fontWeight: 700, color: '#ff6b6b', fontSize: '1.05rem', marginBottom: 2 }}>
          {Math.max(startPrice, highestBid).toLocaleString()}원
        </div>
        <div className="auction-title" style={{ fontSize: '0.98rem', fontWeight: 500, marginBottom: 4, color: '#222', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</div>
        <div className="auction-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
          <span>입찰 {bidCount}건</span>
          <span>조회수 {viewCount}</span>
        </div>
        <div className="auction-meta2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#888', marginTop: 2, alignItems: 'center' }}>
          <span>{formatRemainingTime(remainingSeconds)}</span>
          <span>판매자 {seller}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button
            className="favorite-btn"
            style={{ background: 'none', border: 'none', color: isFavorited ? '#ff6b6b' : '#bbb', fontSize: '1.2rem', cursor: 'pointer', padding: 0 }}
            onClick={() => onToggleFavorite && onToggleFavorite(id)}
            aria-label={isFavorited ? '찜 취소' : '찜하기'}
          >
            {isFavorited ? '♥' : '♡'}
          </button>
        </div>
        <Link
          to={`/auction/${id}`}
          style={{ color: '#007bff', textDecoration: 'none', display: 'block', marginTop: 8, fontWeight: 600, fontSize: '0.93rem', textAlign: 'center' }}
        >
          상세보기
        </Link>
      </div>
    </div>
  );
}

AuctionCard.propTypes = {
  auction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    startPrice: PropTypes.number.isRequired,
    highestBid: PropTypes.number,
    endAt: PropTypes.string,
    imageBase64: PropTypes.string,
    bidCount: PropTypes.number,
    viewCount: PropTypes.number,
    seller: PropTypes.string,
    isFavorited: PropTypes.bool,
  }).isRequired,
  onToggleFavorite: PropTypes.func,
};

export default AuctionCard;
