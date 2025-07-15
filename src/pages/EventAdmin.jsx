import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/EventAdmin.css';

const EventAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('🚀 이벤트 관리자 데이터 로드 시작');
      
      const response = await axios.get('/api/event/admin');
      console.log('✅ 이벤트 관리자 API 응답:', response.data);
      
      setEvents(response.data);
    } catch (error) {
      console.error('❌ 이벤트 관리자 데이터 로드 실패:', error);
      
      // API 실패 시 임시 데이터 사용
      const mockEvents = [
        {
          id: 1,
          title: "신년 맞이 특별 경매 이벤트",
          content: "2024년 새해를 맞이하여 특별한 경매 이벤트를 진행합니다. 다양한 프리미엄 상품들을 특가로 만나보세요!",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          status: "published",
          imageUrl: "https://placehold.co/300x200/3498db/ffffff?text=신년+이벤트",
          views: 8900,
          important: true,
          category: "특별경매",
          author: "관리자"
        },
        {
          id: 2,
          title: "봄맞이 꽃 경매 페스티벌",
          content: "봄의 아름다운 꽃들과 함께하는 특별한 경매 이벤트입니다. 희귀한 꽃들과 화분들을 만나보세요.",
          startDate: "2024-03-01",
          endDate: "2024-03-31",
          status: "draft",
          imageUrl: "https://placehold.co/300x200/2ecc71/ffffff?text=봄+이벤트",
          views: 2340,
          important: false,
          category: "시즌",
          author: "관리자"
        }
      ];
      
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      published: '발행됨',
      draft: '임시저장',
      ended: '종료'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      published: '#27ae60',
      draft: '#f39c12',
      ended: '#e74c3c'
    };
    return colors[status] || '#666';
  };

  const getCategoryColor = (category) => {
    const colors = {
      promotion: '#e74c3c',
      seasonal: '#2ecc71',
      thanksgiving: '#f39c12',
      holiday: '#9b59b6',
      special: '#3498db',
      general: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const isEventActive = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return now >= startDate && now <= endDate;
  };

  const isEventUpcoming = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    return now < startDate;
  };

  const isEventEnded = (event) => {
    const now = new Date();
    const endDate = new Date(event.endDate);
    return now > endDate;
  };

  // 필터링된 이벤트
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.content && event.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 페이징
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        console.log('🗑️ 이벤트 삭제 시작:', selectedEvent.id);
        await axios.delete(`/api/event/admin/${selectedEvent.id}`);
        console.log('✅ 이벤트 삭제 완료');
        
        // 목록 새로고침
        await loadEvents();
        setShowDeleteModal(false);
        setSelectedEvent(null);
        alert('이벤트가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 이벤트 삭제 실패:', error);
        alert('이벤트 삭제에 실패했습니다: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEvent) {
        // 수정
        console.log('✏️ 이벤트 수정 시작:', editingEvent.id);
        const updateData = {
          ...formData,
          id: editingEvent.id,
          status: formData.status || 'published'
        };
        
        await axios.put('/api/event/admin', updateData);
        console.log('✅ 이벤트 수정 완료');
        alert('이벤트가 성공적으로 수정되었습니다.');
      } else {
        // 새 이벤트
        console.log('➕ 새 이벤트 생성 시작');
        const createData = {
          ...formData,
          status: formData.status || 'published',
          author: formData.author || '관리자'
        };
        
        await axios.post('/api/event/admin', createData);
        console.log('✅ 이벤트 생성 완료');
        alert('이벤트가 성공적으로 생성되었습니다.');
      }
      
      // 목록 새로고침
      await loadEvents();
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('❌ 이벤트 저장 실패:', error);
      alert('이벤트 저장에 실패했습니다: ' + (error.response?.data || error.message));
    }
  };

  if (loading) {
    return (
      <div className="event-admin-loading">
        <div className="loading-spinner"></div>
        <p>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="event-admin-page">
      {/* 헤더 */}
      <div className="event-admin-header">
        <div className="header-content">
          <h1>🎉 이벤트 관리</h1>
          <p>경매 이벤트를 생성, 수정, 삭제할 수 있습니다</p>
        </div>
        <button onClick={handleNewEvent} className="new-event-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 이벤트 작성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{events.length}</div>
          <div className="stat-label">전체 이벤트</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{events.filter(e => e.status === 'published').length}</div>
          <div className="stat-label">발행됨</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{events.filter(e => e.status === 'draft').length}</div>
          <div className="stat-label">임시저장</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{events.filter(e => e.important).length}</div>
          <div className="stat-label">중요 이벤트</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 이벤트 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">📋 전체 상태</option>
            <option value="published">✅ 발행됨</option>
            <option value="draft">📝 임시저장</option>
            <option value="ended">❌ 종료</option>
          </select>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="event-list-section">
        <div className="list-header">
          <h2>📋 이벤트 목록 ({filteredEvents.length}개)</h2>
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📝</div>
            <p>등록된 이벤트가 없습니다.</p>
            <button onClick={handleNewEvent} className="create-first-btn">
              첫 번째 이벤트 작성하기
            </button>
          </div>
        ) : (
          <div className="event-table">
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>상태</th>
                  <th>기간</th>
                  <th>조회수</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="event-title-cell">
                      <div className="event-title">
                        {event.important && <span className="important-badge">⭐</span>}
                        {event.title}
                      </div>
                      <div className="event-preview">{event.content?.substring(0, 50)}...</div>
                    </td>
                    <td>
                      <span className="category-badge" style={{ backgroundColor: getCategoryColor(event.category) }}>
                        {event.category || '일반'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td>
                      <div className="date-info">
                        <div>시작: {formatDate(event.startDate)}</div>
                        <div>종료: {formatDate(event.endDate)}</div>
                      </div>
                    </td>
                    <td>{(event.views || 0).toLocaleString()}</td>
                    <td>{event.author || '관리자'}</td>
                    <td>{formatDate(event.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(event)}
                          className="edit-btn"
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(event)}
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
            <h3>이벤트 삭제</h3>
            <p>"{selectedEvent?.title}" 이벤트를 삭제하시겠습니까?</p>
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

      {/* 이벤트 작성/수정 폼 */}
      {showForm && (
        <EventForm 
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

// 이벤트 작성/수정 폼 컴포넌트
const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate || '',
    endDate: event?.endDate || '',
    status: event?.status || 'upcoming',
    imageUrl: event?.imageUrl || '',
    isFeatured: event?.isFeatured || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <h3>{event ? '이벤트 수정' : '새 이벤트 작성'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이벤트 제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="이벤트 제목을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>이벤트 설명 *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="6"
              className="form-textarea"
              placeholder="이벤트 설명을 입력하세요"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>시작일 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>종료일 *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="upcoming">예정</option>
                <option value="active">진행중</option>
                <option value="ended">종료</option>
              </select>
            </div>

            <div className="form-group">
              <label>이미지 URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              추천 이벤트로 설정
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="submit-btn">
              {event ? '수정' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventAdmin; 