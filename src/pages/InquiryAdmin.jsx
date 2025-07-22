import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/InquiryAdmin.css';
import axios from '../axiosConfig';

const InquiryAdmin = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusFilter = async (status) => {
    await axios.post(`/api/inquiry/admin/status/${status}`,{
      status: status,
      id: id
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
    setStatusFilter(status);
  };

  const loadInquiries = async () => {
    // 임시 문의 데이터
    const response = await axios.get('/api/inquiry/admin');
    setInquiries(response.data);
    setLoading(false);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      auction: '경매',
      payment: '결제',
      delivery: '배송',
      refund: '환불/교환',
      account: '회원정보',
      technical: '기술지원'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      auction: '#3498db',
      payment: '#f39c12',
      delivery: '#2ecc71',
      refund: '#e74c3c',
      account: '#9b59b6',
      technical: '#34495e'
    };
    return colors[category] || '#666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: '대기중',
      in_progress: '처리중',
      completed: '완료'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      in_progress: '#3498db',
      completed: '#27ae60'
    };
    return colors[status] || '#666';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음'
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c'
    };
    return colors[priority] || '#666';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 필터링된 문의
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || inquiry.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 페이징
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleReply = (inquiry) => {
    setReplyingTo(inquiry);
    setShowReplyModal(true);
  };

  const handleStatusChange = (inquiryId, newStatus) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId 
        ? { ...inquiry, status: newStatus }
        : inquiry
    ));
  };

  const handleReplySubmit = (replyContent) => {
    if (replyingTo) {
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === replyingTo.id 
          ? { 
              ...inquiry, 
              reply: replyContent,
              hasReply: true,
              status: 'completed'
            }
          : inquiry
      ));
      setShowReplyModal(false);
      setReplyingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="inquiry-admin-loading">
        <div className="loading-spinner"></div>
        <p>문의를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="inquiry-admin-page">
      {/* 헤더 */}
      <div className="inquiry-admin-header">
        <div className="header-content">
          <h1>문의 관리</h1>
          <p>고객 문의를 관리하고 답변할 수 있습니다</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{inquiries.filter(i => i.status === 'pending').length}</span>
            <span className="stat-label">대기중</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{inquiries.filter(i => i.status === 'in_progress').length}</span>
            <span className="stat-label">처리중</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="제목, 내용, 작성자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        <div className="filter-options">
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="in_progress">처리중</option>
            <option value="completed">완료</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 카테고리</option>
            <option value="auction">경매</option>
            <option value="payment">결제</option>
            <option value="delivery">배송</option>
            <option value="refund">환불/교환</option>
            <option value="account">회원정보</option>
            <option value="technical">기술지원</option>
          </select>
        </div>
      </div>

      {/* 통계 */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{inquiries.length}</div>
          <div className="stat-label">전체 문의</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inquiries.filter(i => i.hasReply).length}</div>
          <div className="stat-label">답변 완료</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inquiries.filter(i => i.priority === 'high').length}</div>
          <div className="stat-label">긴급 문의</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inquiries.filter(i => i.category === 'auction').length}</div>
          <div className="stat-label">경매 관련</div>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="inquiry-list-section">
        <div className="list-header">
          <h2>문의 목록</h2>
          <span className="result-count">총 {filteredInquiries.length}개</span>
        </div>

        <div className="inquiry-table">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>카테고리</th>
                <th>작성자</th>
                <th>우선순위</th>
                <th>상태</th>
                <th>작성일</th>
                <th>답변</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInquiries.map((inquiry, index) => (
                <tr key={inquiry.id} className={inquiry.priority === 'high' ? 'high-priority' : ''}>
                  <td>{startIndex + index + 1}</td>
                  <td className="title-cell">
                    <div className="title-content">
                      <span className="title-text">{inquiry.title}</span>
                      {inquiry.priority === 'high' && <span className="urgent-badge">긴급</span>}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(inquiry.category) }}
                    >
                      {getCategoryLabel(inquiry.category)}
                    </span>
                  </td>
                  <td>
                    <div className="author-info">
                      <span className="author-name">{inquiry.author}</span>
                      <span className="author-email">{inquiry.email}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(inquiry.priority) }}
                    >
                      {getPriorityLabel(inquiry.priority)}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(inquiry.status) }}
                    >
                      {getStatusLabel(inquiry.status)}
                    </span>
                  </td>
                  <td>{formatDate(inquiry.date)}</td>
                  <td>
                    <span className={`reply-status ${inquiry.hasReply ? 'replied' : 'pending'}`}>
                      {inquiry.hasReply ? '답변완료' : '답변대기'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewDetail(inquiry)}
                        className="view-btn"
                        title="상세보기"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      {!inquiry.hasReply && (
                        <button 
                          onClick={() => handleReply(inquiry)}
                          className="reply-btn"
                          title="답변"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="M21 12v7a2 2 0 0,1 -2,2H5a2 2 0 0,1 -2,-2V5a2 2 0 0,1 2,-2h11"></path>
                          </svg>
                        </button>
                      )}
                      <select 
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">대기중</option>
                        <option value="in_progress">처리중</option>
                        <option value="completed">완료</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 문의 상세 모달 */}
      {showDetailModal && selectedInquiry && (
        <InquiryDetailModal 
          inquiry={selectedInquiry}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInquiry(null);
          }}
          onReply={() => {
            setShowDetailModal(false);
            setSelectedInquiry(null);
            setReplyingTo(selectedInquiry);
            setShowReplyModal(true);
          }}
        />
      )}

      {/* 답변 작성 모달 */}
      {showReplyModal && replyingTo && (
        <ReplyModal 
          inquiry={replyingTo}
          onSubmit={handleReplySubmit}
          onClose={() => {
            setShowReplyModal(false);
            setReplyingTo(null);
          }}
        />
      )}
    </div>
  );
};

// 문의 상세 모달 컴포넌트
const InquiryDetailModal = ({ inquiry, onClose, onReply }) => {
  return (
    <div className="modal-overlay">
      <div className="detail-modal">
        <div className="modal-header">
          <h3>문의 상세</h3>
          <button onClick={onClose} className="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="inquiry-detail">
          <div className="detail-header">
            <h4>{inquiry.title}</h4>
            <div className="detail-meta">
              <span className="meta-item">작성자: {inquiry.author}</span>
              <span className="meta-item">이메일: {inquiry.email}</span>
              <span className="meta-item">작성일: {new Date(inquiry.date).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          <div className="detail-content">
            <h5>문의 내용</h5>
            <p>{inquiry.content}</p>
          </div>

          {inquiry.hasReply && (
            <div className="detail-reply">
              <h5>답변</h5>
              <p>{inquiry.reply}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {!inquiry.hasReply && (
            <button onClick={onReply} className="reply-btn">
              답변 작성
            </button>
          )}
          <button onClick={onClose} className="close-action-btn">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// 답변 작성 모달 컴포넌트
const ReplyModal = ({ inquiry, onSubmit, onClose }) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onSubmit(replyContent);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="reply-modal">
        <div className="modal-header">
          <h3>답변 작성</h3>
          <button onClick={onClose} className="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="reply-form">
          <div className="inquiry-summary">
            <h4>문의 내용</h4>
            <p className="inquiry-title">{inquiry.title}</p>
            <p className="inquiry-content">{inquiry.content}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>답변 내용 *</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows="8"
                className="form-textarea"
                placeholder="답변 내용을 입력하세요"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                취소
              </button>
              <button type="submit" className="submit-btn">
                답변 등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InquiryAdmin; 