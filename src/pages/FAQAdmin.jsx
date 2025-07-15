import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import '../style/FAQAdmin.css';

const FAQAdmin = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());

  const itemsPerPage = 10;
  const isAdmin = user && user.role === 'ADMIN';

  useEffect(() => {
    if (!user) {
      // navigate('/login');
      return;
    }
    loadFAQs();
  }, [user, navigate]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      console.log('🚀 FAQ 관리자 데이터 로드 시작');
      
      const response = await axios.get('/api/faq/admin');
      console.log('✅ FAQ 관리자 API 응답:', response.data);
      
      setFaqs(response.data);
    } catch (error) {
      console.error('❌ FAQ 관리자 데이터 로드 실패:', error);
      
      // API 실패 시 임시 데이터 사용
      const mockFAQs = [
        {
          id: 1,
          question: "경매에 참여하려면 어떻게 해야 하나요?",
          answer: "경매 참여를 위해서는 먼저 회원가입을 완료하고 본인인증을 진행해야 합니다. 그 후 원하는 경매 상품을 찾아 입찰하시면 됩니다.",
          category: "auction",
          status: "published",
          author: "관리자"
        },
        {
          id: 2,
          question: "입찰금은 언제 환불되나요?",
          answer: "낙찰되지 않은 경우 입찰금은 자동으로 환불되며, 환불까지는 1-2일 정도 소요됩니다. 낙찰된 경우 입찰금은 상품 대금으로 자동 처리됩니다.",
          category: "payment",
          status: "published",
          author: "관리자"
        }
      ];
      
      setFaqs(mockFAQs);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  // 필터링된 FAQ
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // 페이징
  const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFAQs = filteredFAQs.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (faq) => {
    setSelectedFAQ(faq);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedFAQ) {
      try {
        console.log('🗑️ FAQ 삭제 시작:', selectedFAQ.id);
        await axios.delete(`/api/faq/admin/${selectedFAQ.id}`);
        console.log('✅ FAQ 삭제 완료');
        
        // 목록 새로고침
        await loadFAQs();
        setShowDeleteModal(false);
        setSelectedFAQ(null);
        alert('FAQ가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('❌ FAQ 삭제 실패:', error);
        alert('FAQ 삭제에 실패했습니다: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setShowForm(true);
  };

  const handleNewFAQ = () => {
    setEditingFAQ(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingFAQ) {
        // 수정
        console.log('✏️ FAQ 수정 시작:', editingFAQ.id);
        const updateData = {
          ...formData,
          id: editingFAQ.id,
          status: formData.status || 'published'
        };
        
        await axios.put('/api/faq/admin', updateData);
        console.log('✅ FAQ 수정 완료');
        alert('FAQ가 성공적으로 수정되었습니다.');
      } else {
        // 새 FAQ
        console.log('➕ 새 FAQ 생성 시작');
        const createData = {
          ...formData,
          status: formData.status || 'published',
          author: formData.author || '관리자'
        };
        
        await axios.post('/api/faq/admin', createData);
        console.log('✅ FAQ 생성 완료');
        alert('FAQ가 성공적으로 생성되었습니다.');
      }
      
      // 목록 새로고침
      await loadFAQs();
      setShowForm(false);
      setEditingFAQ(null);
    } catch (error) {
      console.error('❌ FAQ 저장 실패:', error);
      alert('FAQ 저장에 실패했습니다: ' + (error.response?.data || error.message));
    }
  };

  if (loading) {
    return (
      <div className="faq-admin-loading">
        <div className="loading-spinner"></div>
        <p>FAQ를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="faq-admin-page">
      {/* 헤더 */}
      <div className="faq-admin-header">
        <div className="header-content">
          <h1>❓ FAQ 관리</h1>
          <p>자주 묻는 질문을 생성, 수정, 삭제할 수 있습니다</p>
        </div>
        <button onClick={handleNewFAQ} className="new-faq-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 FAQ 작성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{faqs.length}</div>
          <div className="stat-label">전체 FAQ</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{faqs.filter(f => f.status === 'published').length}</div>
          <div className="stat-label">발행됨</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{faqs.filter(f => f.status === 'draft').length}</div>
          <div className="stat-label">임시저장</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-number">{faqs.reduce((sum, f) => sum + (f.views || 0), 0).toLocaleString()}</div>
          <div className="stat-label">총 조회수</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 FAQ 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">📋 전체 카테고리</option>
            <option value="auction">🔨 경매</option>
            <option value="payment">💳 결제</option>
            <option value="delivery">🚚 배송</option>
            <option value="refund">🔄 환불/교환</option>
            <option value="account">👤 회원정보</option>
            <option value="technical">🔧 기술지원</option>
          </select>
        </div>
      </div>

      {/* FAQ 목록 */}
      <div className="faq-list-section">
        <div className="list-header">
          <h2>📋 FAQ 목록 ({filteredFAQs.length}개)</h2>
        </div>

        {paginatedFAQs.length === 0 ? (
          <div className="no-faqs">
            <div className="no-faqs-icon">❓</div>
            <p>등록된 FAQ가 없습니다.</p>
            <button onClick={handleNewFAQ} className="create-first-btn">
              첫 번째 FAQ 작성하기
            </button>
          </div>
        ) : (
          <div className="faq-table">
            <table>
              <thead>
                <tr>
                  <th>질문</th>
                  <th>카테고리</th>
                  <th>상태</th>
                  <th>조회수</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFAQs.map((faq) => (
                  <tr key={faq.id}>
                    <td className="faq-question-cell">
                      <div className="faq-question">{faq.question}</div>
                      <div className="faq-answer-preview">{faq.answer?.substring(0, 80)}...</div>
                    </td>
                    <td>
                      <span className="category-badge" style={{ backgroundColor: getCategoryColor(faq.category) }}>
                        {getCategoryLabel(faq.category)}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: faq.status === 'published' ? '#27ae60' : '#f39c12' }}>
                        {faq.status === 'published' ? '✅ 발행' : '📝 임시저장'}
                      </span>
                    </td>
                    <td>{(faq.views || 0).toLocaleString()}</td>
                    <td>{faq.author || '관리자'}</td>
                    <td>{formatDate(faq.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(faq)}
                          className="edit-btn"
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(faq)}
                          className="delete-btn"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              ← 이전
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
              다음 →
            </button>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>FAQ 삭제</h3>
            <p>"{selectedFAQ?.question}" FAQ를 삭제하시겠습니까?</p>
            <p className="warning-text">이 작업은 되돌릴 수 없습니다.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                취소
              </button>
              <button onClick={confirmDelete} className="delete-btn">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 작성/수정 폼 */}
      {showForm && (
        <FAQForm 
          faq={editingFAQ}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingFAQ(null);
          }}
        />
      )}
    </div>
  );
};

// FAQ 작성/수정 폼 컴포넌트
const FAQForm = ({ faq, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || 'auction',
    order: faq?.order || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <h3>{faq ? 'FAQ 수정' : '새 FAQ 작성'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>질문 *</label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="질문을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>답변 *</label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              required
              rows="8"
              className="form-textarea"
              placeholder="답변을 입력하세요"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="auction">경매</option>
                <option value="payment">결제</option>
                <option value="delivery">배송</option>
                <option value="refund">환불/교환</option>
                <option value="account">회원정보</option>
                <option value="technical">기술지원</option>
              </select>
            </div>

            <div className="form-group">
              <label>표시 순서</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="1"
                className="form-input"
                placeholder="1"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="submit-btn">
              {faq ? '수정' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FAQAdmin; 