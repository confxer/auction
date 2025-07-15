import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/FAQ.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      
      // 공개된 FAQ만 가져오기
      const response = await axios.get('/api/faq/published');
      const apiFAQs = response.data;
      
      // 응답이 배열인지 확인하고 안전하게 설정
      if (Array.isArray(apiFAQs)) {
        setFaqs(apiFAQs);
      } else {
        console.warn('API 응답이 배열이 아닙니다:', apiFAQs);
        setFaqs([]);
      }
    } catch (error) {
      console.error('FAQ 로드 실패:', error);
      
      // API 실패 시 임시 데이터 사용
      const mockFAQs = [
        {
          id: 1,
          category: 'account',
          question: '회원가입은 어떻게 하나요?',
          answer: '몬스터옥션 회원가입은 매우 간단합니다. 홈페이지 상단의 "회원가입" 버튼을 클릭하신 후, 이메일 주소와 비밀번호를 입력하시면 됩니다. 가입 후 이메일 인증을 완료하시면 모든 서비스를 이용하실 수 있습니다.'
        },
        {
          id: 2,
          category: 'auction',
          question: '경매에 참여하려면 어떻게 해야 하나요?',
          answer: '경매 참여를 위해서는 먼저 회원가입과 본인인증이 필요합니다. 경매 상품을 선택하신 후 "입찰하기" 버튼을 클릭하여 원하시는 금액을 입력하시면 됩니다. 실시간으로 다른 입찰자들과 경쟁하실 수 있습니다.'
        }
      ];
      
      setFaqs(mockFAQs);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'account', name: '회원정보', icon: '👤' },
    { id: 'auction', question: '경매', icon: '🔨' },
    { id: 'payment', name: '결제', icon: '💳' },
    { id: 'delivery', name: '배송', icon: '🚚' },
    { id: 'refund', name: '환불/교환', icon: '🔄' },
    { id: 'security', name: '보안', icon: '🔒' }
  ];

  const filteredFAQs = Array.isArray(faqs) ? faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // 검색 로직은 이미 실시간으로 처리됨
  };

  if (loading) {
    return (
      <div className="faq-loading">
        <div className="loading-spinner"></div>
        <p>FAQ를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="faq-page">
      {/* 헤더 */}
      <div className="faq-header">
        <h1>자주 묻는 질문</h1>
        <p>몬스터옥션 이용 시 궁금한 점들을 빠르게 찾아보세요</p>
      </div>

      {/* 검색 */}
      <div className="faq-search">
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
      </div>

      {/* 카테고리 필터 */}
      <div className="faq-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* FAQ 목록 */}
      <div className="faq-list">
        {filteredFAQs.length === 0 ? (
          <div className="no-faqs">
            <div className="no-faqs-icon">❓</div>
            <p>검색 결과가 없습니다.</p>
            <span>다른 검색어를 입력해보세요.</span>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${expandedItems.has(faq.id) ? 'expanded' : ''}`}
                onClick={() => toggleExpanded(faq.id)}
              >
                <span className="question-text">{faq.question}</span>
                <span className="expand-icon">
                  {expandedItems.has(faq.id) ? '−' : '+'}
                </span>
              </button>
              <div className={`faq-answer ${expandedItems.has(faq.id) ? 'expanded' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 추가 도움말 */}
      <div className="faq-help">
        <h3>더 자세한 도움이 필요하신가요?</h3>
        <div className="help-options">
          <Link to="/inquiry" className="help-option">
            <div className="help-icon">📞</div>
            <div className="help-content">
              <h4>1:1 문의하기</h4>
              <p>직접 문의하여 빠른 답변을 받아보세요</p>
            </div>
          </Link>
          <Link to="/customer-service" className="help-option">
            <div className="help-icon">💬</div>
            <div className="help-content">
              <h4>고객센터</h4>
              <p>전화 또는 채팅으로 상담받기</p>
            </div>
          </Link>
          <a href="tel:1588-1234" className="help-option">
            <div className="help-icon">📱</div>
            <div className="help-content">
              <h4>전화 상담</h4>
              <p>1588-1234 (평일 09:00-18:00)</p>
            </div>
          </a>
        </div>
      </div>


    </div>
  );
};

export default FAQ; 