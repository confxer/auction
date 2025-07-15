import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/Event.css';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ongoing');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEvents();
  }, [currentPage, filterType]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('🚀 이벤트 데이터 로드 시작');
      
      // 공개된 이벤트만 가져오기
      const response = await axios.get('/api/event/published');
      console.log('✅ 이벤트 API 응답:', response.data);
      let apiEvents = response.data;
      
      // 응답이 배열인지 확인하고 안전하게 설정
      if (!Array.isArray(apiEvents)) {
        console.warn('⚠️ API 응답이 배열이 아닙니다:', apiEvents);
        apiEvents = [];
      }
      
      console.log('📊 받은 이벤트 개수:', apiEvents.length);
      console.log('📋 이벤트 데이터:', apiEvents);
      
      // 각 이벤트의 상세 정보 확인
      apiEvents.forEach((event, index) => {
        console.log(`📋 이벤트 ${index + 1}:`, {
          id: event.id,
          title: event.title,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate,
          category: event.category
        });
      });
      
      // 필터링 적용
      let filteredEvents = apiEvents;
      
      if (filterType === 'ongoing') {
        // published 상태이면서 현재 날짜가 시작일과 종료일 사이에 있는 이벤트
        filteredEvents = apiEvents.filter(event => {
          console.log(`🔍 이벤트 "${event.title}" 상태 확인:`, event.status);
          const now = new Date();
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          const isOngoing = event.status === 'published' && now >= startDate && now <= endDate;
          console.log(`📅 날짜 확인 - 현재: ${now.toISOString()}, 시작: ${startDate.toISOString()}, 종료: ${endDate.toISOString()}, 진행중: ${isOngoing}`);
          return isOngoing;
        });
        console.log('🔄 진행중 필터 적용 후:', filteredEvents.length, '개');
      } else if (filterType === 'ended') {
        // 종료된 이벤트 (종료일이 지난 이벤트)
        filteredEvents = apiEvents.filter(event => {
          console.log(`🔍 이벤트 "${event.title}" 상태 확인:`, event.status);
          const now = new Date();
          const endDate = new Date(event.endDate);
          const isEnded = now > endDate;
          console.log(`📅 종료 확인 - 현재: ${now.toISOString()}, 종료: ${endDate.toISOString()}, 종료됨: ${isEnded}`);
          return isEnded;
        });
        console.log('🔄 종료된 필터 적용 후:', filteredEvents.length, '개');
      }

      // 검색어 적용
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.subtitle && event.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        console.log('🔍 검색어 필터 적용 후:', filteredEvents.length, '개');
      }

      // 최신순 정렬
      filteredEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      // 페이징 적용
      const itemsPerPage = 6;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pagedEvents = filteredEvents.slice(startIndex, endIndex);

      console.log('📄 페이징 적용 후:', pagedEvents.length, '개');
      console.log('🎯 최종 이벤트 데이터:', pagedEvents);

      setEvents(pagedEvents);
      setTotalPages(Math.ceil(filteredEvents.length / itemsPerPage));
    } catch (error) {
      console.error('❌ 이벤트 로드 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data || error.message);
      
      // API 실패 시 임시 데이터 사용
      const mockEvents = [
        {
          id: 1,
          title: "신년 맞이 특별 이벤트",
          subtitle: "2024년 새해를 맞이하여 특별한 혜택을 드립니다!",
          description: "1월 한 달간 경매 수수료 50% 할인 혜택을 드립니다. 신규 회원 가입 시 추가 혜택도 함께 제공됩니다.",
          image: "https://placehold.co/400x250/3498db/ffffff?text=신년+이벤트",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          status: "ongoing",
          category: "discount",
          participants: 1250,
          isHot: true
        },
        {
          id: 2,
          title: "첫 경매 참여 이벤트",
          subtitle: "처음 경매에 참여하시는 분들을 위한 특별 이벤트",
          description: "첫 경매 참여 시 수수료 면제 및 10,000원 할인 쿠폰을 제공합니다. 경험해보세요!",
          image: "https://placehold.co/400x250/e74c3c/ffffff?text=첫+경매+이벤트",
          startDate: "2024-01-15",
          endDate: "2024-02-15",
          status: "ongoing",
          category: "newbie",
          participants: 890,
          isHot: false
        }
      ];
      
      console.log('🔄 임시 데이터 사용:', mockEvents);
      setEvents(mockEvents);
      setTotalPages(1);
    } finally {
      console.log('🏁 이벤트 로딩 완료');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEvents();
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      discount: '할인',
      newbie: '신규회원',
      seasonal: '시즌',
      thanks: '감사'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      discount: '#e74c3c',
      newbie: '#3498db',
      seasonal: '#2ecc71',
      thanks: '#f39c12'
    };
    return colors[category] || '#666';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="event-loading">
        <div className="loading-spinner"></div>
        <p>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="event-page">
      {/* 헤더 */}
      <div className="event-header">
        <h1>이벤트</h1>
        <p>몬스터옥션의 다양한 이벤트와 특별한 혜택을 확인하세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="event-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="이벤트 검색..."
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
            className={`filter-btn ${filterType === 'ongoing' ? 'active' : ''}`}
            onClick={() => handleFilterChange('ongoing')}
          >
            진행중
          </button>
          <button
            className={`filter-btn ${filterType === 'ended' ? 'active' : ''}`}
            onClick={() => handleFilterChange('ended')}
          >
            종료된 이벤트
          </button>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="event-list">
        {events.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">🎉</div>
            <p>검색 결과가 없습니다.</p>
            <span>다른 검색어를 입력해보세요.</span>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <Link to={`/event/${event.id}`} key={event.id} className="event-card">
                <div className="event-image">
                  <img src={event.imageUrl || event.image || "https://placehold.co/400x250/3498db/ffffff?text=이벤트+이미지"} alt={event.title} />
                  {event.isHot && <span className="hot-badge">HOT</span>}
                  {event.status === 'ended' && <span className="ended-badge">종료</span>}
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryColor(event.category) }}
                  >
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-subtitle">{event.subtitle || ''}</p>
                  <p className="event-description">{event.content || event.description || ''}</p>
                  <div className="event-meta">
                    <div className="event-dates">
                      <span className="date-label">기간:</span>
                      <span className="date-value">
                        {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                      </span>
                    </div>
                    {event.status === 'ongoing' && (
                      <div className="days-left">
                        <span className="days-label">남은 기간:</span>
                        <span className="days-value">{getDaysLeft(event.endDate)}일</span>
                      </div>
                    )}
                    <div className="event-participants">
                      <span className="participants-label">참여자:</span>
                      <span className="participants-value">{(event.participants || 0).toLocaleString()}명</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
    </div>
  );
};

export default Event; 