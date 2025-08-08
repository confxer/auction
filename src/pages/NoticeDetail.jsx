import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../style/NoticeDetail.css';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevNotice, setPrevNotice] = useState(null);
  const [nextNotice, setNextNotice] = useState(null);

  useEffect(() => {
    loadNoticeDetail();
  }, [id]);

  const getCategoryLabel = (category) => {
    const labels = {
      important: '중요',
      event: '이벤트',
      maintenance: '점검',
      guide: '가이드',
      update: '업데이트'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      important: '#e74c3c',
      event: '#f39c12',
      maintenance: '#3498db',
      guide: '#27ae60',
      update: '#9b59b6'
    };
    return colors[category] || '#666';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="notice-detail-loading">
        <div className="loading-spinner"></div>
        <p>공지사항을 불러오는 중...</p>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="notice-detail-error">
        <div className="error-icon">⚠️</div>
        <h2>공지사항을 찾을 수 없습니다</h2>
        <p>요청하신 공지사항이 존재하지 않거나 삭제되었습니다.</p>
        <Link to="/notice" className="back-button">공지사항 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="notice-detail-page">
      {/* 헤더 */}
      <div className="notice-detail-header">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span className="separator">›</span>
          <Link to="/notice">공지사항</Link>
          <span className="separator">›</span>
          <span className="current">상세보기</span>
        </div>
        
        <div className="notice-title-section">
          <div className="notice-badges">
            {notice.isImportant && <span className="important-badge">중요</span>}
            <span 
              className="category-badge" 
              style={{ backgroundColor: getCategoryColor(notice.category) }}
            >
              {getCategoryLabel(notice.category)}
            </span>
          </div>
          <h1>{notice.title}</h1>
          <div className="notice-meta">
            <div className="meta-item">
              <span className="label">작성일:</span>
              <span className="value">{formatDate(notice.date)}</span>
            </div>
            <div className="meta-item">
              <span className="label">작성자:</span>
              <span className="value">{notice.author}</span>
            </div>
            <div className="meta-item">
              <span className="label">조회수:</span>
              <span className="value">{notice.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 공지 내용 */}
      <div className="notice-content-section">
        <div 
          className="notice-content"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      </div>

      {/* 이전/다음 공지 네비게이션 */}
      <div className="notice-navigation">
        <div className="nav-item prev">
          {prevNotice ? (
            <Link to={`/notice/${prevNotice.id}`} className="nav-link">
              <div className="nav-label">이전 공지</div>
              <div className="nav-title">{prevNotice.title}</div>
              <div className="nav-date">{prevNotice.date}</div>
            </Link>
          ) : (
            <div className="nav-link disabled">
              <div className="nav-label">이전 공지</div>
              <div className="nav-title">이전 공지가 없습니다</div>
            </div>
          )}
        </div>
        
        <div className="nav-item next">
          {nextNotice ? (
            <Link to={`/notice/${nextNotice.id}`} className="nav-link">
              <div className="nav-label">다음 공지</div>
              <div className="nav-title">{nextNotice.title}</div>
              <div className="nav-date">{nextNotice.date}</div>
            </Link>
          ) : (
            <div className="nav-link disabled">
              <div className="nav-label">다음 공지</div>
              <div className="nav-title">다음 공지가 없습니다</div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="notice-actions">
        <Link to="/notice" className="action-button secondary">
          목록으로
        </Link>
        <button 
          className="action-button primary"
          onClick={() => window.print()}
        >
          인쇄하기
        </button>
      </div>

      {/* 관련 링크 */}
      <div className="related-links">
        <h3>관련 링크</h3>
        <div className="link-grid">
          <Link to="/faq" className="related-link">
            <div className="link-icon">❓</div>
            <div className="link-text">자주 묻는 질문</div>
          </Link>
          <Link to="/inquiry" className="related-link">
            <div className="link-icon">📞</div>
            <div className="link-text">1:1 문의하기</div>
          </Link>
          <Link to="/event" className="related-link">
            <div className="link-icon">🎉</div>
            <div className="link-text">이벤트</div>
          </Link>
          <Link to="/customer-service" className="related-link">
            <div className="link-icon">💬</div>
            <div className="link-text">고객센터</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail; 