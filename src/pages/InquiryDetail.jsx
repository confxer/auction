import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../style/InquiryDetail.css';

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevInquiry, setPrevInquiry] = useState(null);
  const [nextInquiry, setNextInquiry] = useState(null);

  useEffect(() => {
    loadInquiryDetail();
  }, [id]);

  const loadInquiryDetail = () => {
    // 임시 문의 상세 데이터
    const mockInquiry = {
      id: parseInt(id),
      title: "경매 입찰 관련 문의",
      content: "안녕하세요. 지난주에 경매에 입찰했는데 낙찰이 되지 않았습니다. 입찰 기록은 어디서 확인할 수 있나요? 그리고 입찰금은 언제 환불되나요? 입찰 과정에서 문제가 있었는지 궁금합니다.",
      category: "auction",
      status: "answered",
      date: "2024-01-10",
      answer: "안녕하세요. 문의해 주셔서 감사합니다.\n\n입찰 기록은 마이페이지 > 입찰 내역에서 확인하실 수 있습니다. 낙찰되지 않은 경우 입찰금은 자동으로 환불되며, 환불까지는 1-2일 정도 소요됩니다.\n\n입찰 과정에서 특별한 문제는 없었으며, 다른 입찰자보다 낮은 금액으로 입찰하셨기 때문에 낙찰되지 않은 것으로 보입니다.\n\n추가 문의사항이 있으시면 언제든 연락해 주세요.",
      answerDate: "2024-01-11",
      files: [
        { name: "입찰내역.pdf", size: 245760, url: "#" },
        { name: "스크린샷.png", size: 1024000, url: "#" }
      ],
      answerFiles: [
        { name: "입찰가이드.pdf", size: 512000, url: "#" }
      ]
    };

    // 이전/다음 문의 데이터
    const mockPrevInquiry = {
      id: parseInt(id) - 1,
      title: "배송 지연 문의",
      date: "2024-01-09"
    };

    const mockNextInquiry = {
      id: parseInt(id) + 1,
      title: "환불 신청 방법",
      date: "2024-01-08"
    };

    setInquiry(mockInquiry);
    setPrevInquiry(mockPrevInquiry);
    setNextInquiry(mockNextInquiry);
    setLoading(false);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      auction: '경매',
      delivery: '배송',
      refund: '환불/교환',
      account: '회원정보',
      payment: '결제',
      quality: '상품품질',
      technical: '기술지원'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      auction: '#3498db',
      delivery: '#2ecc71',
      refund: '#e74c3c',
      account: '#9b59b6',
      payment: '#f39c12',
      quality: '#1abc9c',
      technical: '#34495e'
    };
    return colors[category] || '#666';
  };

  const getStatusLabel = (status) => {
    return status === 'answered' ? '답변완료' : '답변대기';
  };

  const getStatusColor = (status) => {
    return status === 'answered' ? '#27ae60' : '#f39c12';
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="inquiry-detail-loading">
        <div className="loading-spinner"></div>
        <p>문의내역을 불러오는 중...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="inquiry-detail-error">
        <div className="error-icon">⚠️</div>
        <h2>문의내역을 찾을 수 없습니다</h2>
        <p>요청하신 문의내역이 존재하지 않거나 삭제되었습니다.</p>
        <Link to="/inquiry" className="back-button">문의 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="inquiry-detail-page">
      {/* 헤더 */}
      <div className="inquiry-detail-header">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span className="separator">›</span>
          <Link to="/inquiry">1:1 문의</Link>
          <span className="separator">›</span>
          <span className="current">상세보기</span>
        </div>
        
        <div className="inquiry-title-section">
          <div className="inquiry-badges">
            <span 
              className="category-badge" 
              style={{ backgroundColor: getCategoryColor(inquiry.category) }}
            >
              {getCategoryLabel(inquiry.category)}
            </span>
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(inquiry.status) }}
            >
              {getStatusLabel(inquiry.status)}
            </span>
          </div>
          <h1>{inquiry.title}</h1>
          <div className="inquiry-meta">
            <div className="meta-item">
              <span className="label">작성일:</span>
              <span className="value">{formatDate(inquiry.date)}</span>
            </div>
            {inquiry.status === 'answered' && (
              <div className="meta-item">
                <span className="label">답변일:</span>
                <span className="value">{formatDate(inquiry.answerDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 문의 내용 */}
      <div className="inquiry-content-section">
        <div className="content-header">
          <h2>문의 내용</h2>
        </div>
        <div className="content-body">
          <p>{inquiry.content}</p>
        </div>
        
        {/* 첨부파일 */}
        {inquiry.files && inquiry.files.length > 0 && (
          <div className="attachments">
            <h3>첨부파일</h3>
            <div className="file-list">
              {inquiry.files.map((file, index) => (
                <a key={index} href={file.url} className="file-item" download>
                  <div className="file-icon">📎</div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 답변 */}
      {inquiry.status === 'answered' && (
        <div className="answer-section">
          <div className="answer-header">
            <h2>답변</h2>
            <span className="answer-date">{formatDate(inquiry.answerDate)}</span>
          </div>
          <div className="answer-body">
            <p style={{ whiteSpace: 'pre-line' }}>{inquiry.answer}</p>
          </div>
          
          {/* 답변 첨부파일 */}
          {inquiry.answerFiles && inquiry.answerFiles.length > 0 && (
            <div className="attachments">
              <h3>답변 첨부파일</h3>
              <div className="file-list">
                {inquiry.answerFiles.map((file, index) => (
                  <a key={index} href={file.url} className="file-item" download>
                    <div className="file-icon">📎</div>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 답변 대기 중 */}
      {inquiry.status === 'pending' && (
        <div className="pending-section">
          <div className="pending-icon">⏳</div>
          <h3>답변 대기 중</h3>
          <p>문의해 주신 내용에 대해 검토 후 답변드리겠습니다.</p>
          <span className="pending-note">답변은 1-2일 내에 등록됩니다.</span>
        </div>
      )}

      {/* 이전/다음 문의 네비게이션 */}
      <div className="inquiry-navigation">
        <div className="nav-item prev">
          {prevInquiry ? (
            <Link to={`/inquiry/${prevInquiry.id}`} className="nav-link">
              <div className="nav-label">이전 문의</div>
              <div className="nav-title">{prevInquiry.title}</div>
              <div className="nav-date">{prevInquiry.date}</div>
            </Link>
          ) : (
            <div className="nav-link disabled">
              <div className="nav-label">이전 문의</div>
              <div className="nav-title">이전 문의가 없습니다</div>
            </div>
          )}
        </div>
        
        <div className="nav-item next">
          {nextInquiry ? (
            <Link to={`/inquiry/${nextInquiry.id}`} className="nav-link">
              <div className="nav-label">다음 문의</div>
              <div className="nav-title">{nextInquiry.title}</div>
              <div className="nav-date">{nextInquiry.date}</div>
            </Link>
          ) : (
            <div className="nav-link disabled">
              <div className="nav-label">다음 문의</div>
              <div className="nav-title">다음 문의가 없습니다</div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="inquiry-actions">
        <Link to="/inquiry" className="action-button secondary">
          목록으로
        </Link>
        <Link to="/inquiry/new" className="action-button primary">
          새 문의 작성
        </Link>
      </div>

      {/* 관련 링크 */}
      <div className="related-links">
        <h3>관련 링크</h3>
        <div className="link-grid">
          <Link to="/faq" className="related-link">
            <div className="link-icon">❓</div>
            <div className="link-text">자주 묻는 질문</div>
          </Link>
          <Link to="/notice" className="related-link">
            <div className="link-icon">📢</div>
            <div className="link-text">공지사항</div>
          </Link>
          <Link to="/customer-service" className="related-link">
            <div className="link-icon">💬</div>
            <div className="link-text">고객센터</div>
          </Link>
          <a href="tel:1588-1234" className="related-link">
            <div className="link-icon">📱</div>
            <div className="link-text">전화 상담</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail; 