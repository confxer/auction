import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import '../style/Inquiry.css';

const Inquiry = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInquiries();
  }, [currentPage, filterType]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      
      // 공개된 FAQ만 가져오기
      const response = await axios.get('/api/faq/published');
      const apiFAQs = response.data;
      
      // 응답이 배열인지 확인하고 안전하게 설정
      if (Array.isArray(apiFAQs)) {
        // 필터링 적용
        let filteredFAQs = apiFAQs;
        
        if (filterType === 'auction') {
          filteredFAQs = apiFAQs.filter(faq => faq.category === 'auction');
        } else if (filterType === 'payment') {
          filteredFAQs = apiFAQs.filter(faq => faq.category === 'payment');
        } else if (filterType === 'delivery') {
          filteredFAQs = apiFAQs.filter(faq => faq.category === 'delivery');
        }

        // 검색어 적용
        if (searchTerm) {
          filteredFAQs = filteredFAQs.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setInquiries(filteredFAQs);
      } else {
        console.warn('API 응답이 배열이 아닙니다:', apiFAQs);
        setInquiries([]);
      }
    } catch (error) {
      console.error('FAQ 로드 실패:', error);
      
      // API 실패 시 임시 데이터 사용
      const mockFAQs = [
        {
          id: 1,
          category: 'auction',
          question: '경매에 참여하려면 어떻게 해야 하나요?',
          answer: '경매 참여를 위해서는 먼저 회원가입과 본인인증이 필요합니다. 경매 상품을 선택하신 후 "입찰하기" 버튼을 클릭하여 원하시는 금액을 입력하시면 됩니다.'
        },
        {
          id: 2,
          category: 'payment',
          question: '결제 방법은 어떤 것들이 있나요?',
          answer: '신용카드, 계좌이체, 가상계좌, 간편결제(카카오페이, 네이버페이, 페이팔) 등 다양한 결제 방법을 제공합니다.'
        },
        {
          id: 3,
          category: 'delivery',
          question: '배송은 언제 시작되나요?',
          answer: '결제 완료 후 1-2일 내에 배송이 시작됩니다. 배송 상황은 마이페이지에서 실시간으로 확인하실 수 있습니다.'
        }
      ];
      
      setInquiries(mockFAQs);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInquiries();
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
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

  if (loading) {
    return (
      <div className="inquiry-loading">
        <div className="loading-spinner"></div>
        <p>FAQ를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="inquiry-page">
      {/* 헤더 */}
      <div className="inquiry-header">
        <h1>자주 묻는 질문</h1>
        <p>궁금한 점들을 빠르게 찾아보세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="inquiry-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="궁금한 내용을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button
            className={`filter-btn ${filterType === 'auction' ? 'active' : ''}`}
            onClick={() => handleFilterChange('auction')}
          >
            경매
          </button>
          <button
            className={`filter-btn ${filterType === 'payment' ? 'active' : ''}`}
            onClick={() => handleFilterChange('payment')}
          >
            결제
          </button>
          <button
            className={`filter-btn ${filterType === 'delivery' ? 'active' : ''}`}
            onClick={() => handleFilterChange('delivery')}
          >
            배송
          </button>
        </div>
      </div>

      {/* FAQ 목록 */}
      <div className="inquiry-list">
        {inquiries.length === 0 ? (
          <div className="no-inquiries">
            <div className="no-inquiries-icon">❓</div>
            <p>검색 결과가 없습니다.</p>
            <span>다른 검색어를 입력해보세요.</span>
          </div>
        ) : (
          inquiries.map((faq) => (
            <div key={faq.id} className="inquiry-item">
              <div className="inquiry-content">
                <div className="inquiry-header">
                  <div className="inquiry-title">
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: getCategoryColor(faq.category) }}
                    >
                      {getCategoryLabel(faq.category)}
                    </span>
                    <h3>{faq.question}</h3>
                  </div>
                </div>
                <p className="inquiry-preview">{faq.answer}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            className="page-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {/* 문의 작성 버튼 - 로그인한 사용자만 */}
      {user && (
        <div className="inquiry-actions">
          <Link to="/inquiry/new" className="new-inquiry-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            새 문의 작성
          </Link>
        </div>
      )}
    </div>
  );
};

export default Inquiry; 