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

  const loadNoticeDetail = () => {
    // 임시 공지사항 상세 데이터
    const mockNotice = {
      id: parseInt(id),
      title: "2024년 몬스터옥션 이용약관 개정 안내",
      content: `
        <h2>안녕하세요, 몬스터옥션을 이용해 주시는 고객님들께 안내드립니다.</h2>
        
        <p>2024년 1월 1일부터 이용약관이 개정되어 적용됩니다. 주요 변경사항은 다음과 같습니다:</p>
        
        <h3>1. 경매 수수료 정책 변경</h3>
        <ul>
          <li>낙찰자 수수료: 기존 5% → 4%로 인하</li>
          <li>출품자 수수료: 기존 3% → 2.5%로 인하</li>
          <li>신규 회원 첫 경매 참여 시 수수료 면제 혜택 확대</li>
        </ul>
        
        <h3>2. 안전거래 보장 강화</h3>
        <ul>
          <li>에스크로 서비스 의무화 (100만원 이상 거래)</li>
          <li>사기 방지 시스템 고도화</li>
          <li>분쟁 해결 절차 개선</li>
        </ul>
        
        <h3>3. 개인정보 보호 강화</h3>
        <ul>
          <li>개인정보 수집·이용 동의 절차 개선</li>
          <li>개인정보 보유기간 단축</li>
          <li>개인정보 처리방침 투명성 강화</li>
        </ul>
        
        <h3>4. 서비스 이용 개선</h3>
        <ul>
          <li>모바일 앱 성능 최적화</li>
          <li>실시간 알림 서비스 개선</li>
          <li>고객센터 응답 시간 단축</li>
        </ul>
        
        <p><strong>변경된 약관은 2024년 1월 1일부터 적용되며, 계속 서비스를 이용하시는 경우 개정된 약관에 동의한 것으로 간주됩니다.</strong></p>
        
        <p>자세한 내용은 고객센터(1588-1234)로 문의해 주시기 바랍니다.</p>
        
        <p>감사합니다.<br>
        몬스터옥션 드림</p>
      `,
      category: "important",
      date: "2024-01-10",
      views: 1250,
      isImportant: true,
      author: "몬스터옥션 관리자"
    };

    // 이전/다음 공지 데이터
    const mockPrevNotice = {
      id: parseInt(id) - 1,
      title: "신년 맞이 특별 이벤트 안내",
      date: "2024-01-08"
    };

    const mockNextNotice = {
      id: parseInt(id) + 1,
      title: "시스템 점검 안내 (1월 15일)",
      date: "2024-01-05"
    };

    setNotice(mockNotice);
    setPrevNotice(mockPrevNotice);
    setNextNotice(mockNextNotice);
    setLoading(false);
  };

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