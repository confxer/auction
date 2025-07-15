import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import '../style/NoticeAdmin.css';

const NoticeAdmin = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const itemsPerPage = 10;
  const isAdmin = user && user.role === 'ADMIN';

  useEffect(() => {
    if (!user) {
      // navigate('/login');
      return;
    }
    loadNotices();
  }, [user, navigate]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 공지사항 관리자 데이터 로드 시작');
      
      const response = await axios.get('/api/notice/admin');
      console.log('✅ 공지사항 관리자 API 응답:', response.data);
      const apiNotices = response.data;
      
      // 응답이 배열인지 확인하고 안전하게 설정
      if (Array.isArray(apiNotices)) {
        setNotices(apiNotices);
      } else {
        console.warn('⚠️ API 응답이 배열이 아닙니다:', apiNotices);
        setNotices([]);
      }
    } catch (error) {
      console.error('❌ 공지사항 관리자 데이터 로드 실패:', error);
      setError('공지사항을 불러오는데 실패했습니다.');
      
      // API 실패 시 임시 데이터 사용
      const mockNotices = [
        {
          id: 1,
          title: "2024년 몬스터옥션 이용약관 개정 안내",
          content: "2024년 1월 1일부터 이용약관이 개정됩니다. 자세한 내용은 본문을 참고해 주세요.",
          category: "important",
          status: "published",
          createdAt: "2024-01-10",
          views: 1250,
          important: true,
          author: "관리자"
        },
        {
          id: 2,
          title: "신년 맞이 특별 이벤트 안내",
          content: "신년을 맞이하여 특별한 이벤트를 준비했습니다. 많은 참여 부탁드립니다.",
          category: "event",
          status: "published",
          createdAt: "2024-01-08",
          views: 890,
          important: false,
          author: "관리자"
        }
      ];
      setNotices(mockNotices);
    } finally {
      setLoading(false);
    }
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

  const getStatusLabel = (status) => {
    return status === 'published' ? '발행' : '임시저장';
  };

  const getStatusColor = (status) => {
    return status === 'published' ? '#27ae60' : '#f39c12';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 필터링된 공지사항
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || notice.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 페이징
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (notice) => {
    setSelectedNotice(notice);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedNotice) {
      try {
        console.log('🗑️ 공지사항 삭제 시작:', selectedNotice.id);
        await axios.delete(`/api/notice/admin/${selectedNotice.id}`);
        console.log('✅ 공지사항 삭제 완료');
        
        // 목록 새로고침
        await loadNotices();
        setShowDeleteModal(false);
        setSelectedNotice(null);
        alert('공지사항이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 공지사항 삭제 실패:', error);
        alert('공지사항 삭제에 실패했습니다: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleNewNotice = () => {
    setEditingNotice(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingNotice) {
        // 수정
        console.log('✏️ 공지사항 수정 시작:', editingNotice.id);
        const updateData = {
          ...formData,
          id: editingNotice.id,
          status: formData.status || 'published'
        };
        
        await axios.put('/api/notice/admin', updateData);
        console.log('✅ 공지사항 수정 완료');
        alert('공지사항이 성공적으로 수정되었습니다.');
      } else {
        // 새 공지사항
        console.log('➕ 새 공지사항 생성 시작');
        const createData = {
          ...formData,
          status: formData.status || 'published',
          author: formData.author || '관리자'
        };
        
        await axios.post('/api/notice/admin', createData);
        console.log('✅ 공지사항 생성 완료');
        alert('공지사항이 성공적으로 생성되었습니다.');
      }
      
      // 목록 새로고침
      await loadNotices();
      setShowForm(false);
      setEditingNotice(null);
    } catch (error) {
      console.error('❌ 공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다: ' + (error.response?.data || error.message));
    }
  };

  if (loading) {
    return (
      <div className="notice-admin-loading">
        <div className="loading-spinner"></div>
        <p>공지사항을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notice-admin-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button onClick={loadNotices} className="retry-btn">다시 시도</button>
      </div>
    );
  }

  return (
    <div className="notice-admin-page">
      {/* 헤더 */}
      <div className="notice-admin-header">
        <div className="header-content">
          <h1>📢 공지사항 관리</h1>
          <p>공지사항을 생성, 수정, 삭제할 수 있습니다</p>
        </div>
        <button onClick={handleNewNotice} className="new-notice-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 공지사항 작성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{notices.length}</div>
          <div className="stat-label">전체 공지사항</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{notices.filter(n => n.status === 'published').length}</div>
          <div className="stat-label">발행됨</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{notices.filter(n => n.status === 'draft').length}</div>
          <div className="stat-label">임시저장</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{notices.filter(n => n.important).length}</div>
          <div className="stat-label">중요 공지</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 공지사항 제목으로 검색..."
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
            <option value="important">⚠️ 중요</option>
            <option value="event">🎉 이벤트</option>
            <option value="maintenance">🔧 점검</option>
            <option value="guide">📖 가이드</option>
            <option value="update">🔄 업데이트</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">📋 전체 상태</option>
            <option value="published">✅ 발행됨</option>
            <option value="draft">📝 임시저장</option>
          </select>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="notice-list-section">
        <div className="list-header">
          <h2>📋 공지사항 목록 ({filteredNotices.length}개)</h2>
        </div>

        {paginatedNotices.length === 0 ? (
          <div className="no-notices">
            <div className="no-notices-icon">📢</div>
            <p>등록된 공지사항이 없습니다.</p>
            <button onClick={handleNewNotice} className="create-first-btn">
              첫 번째 공지사항 작성하기
            </button>
          </div>
        ) : (
          <div className="notice-table">
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>상태</th>
                  <th>중요도</th>
                  <th>조회수</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotices.map((notice) => (
                  <tr key={notice.id}>
                    <td className="notice-title-cell">
                      <div className="notice-title">
                        {notice.important && <span className="important-badge">⭐</span>}
                        {notice.title}
                      </div>
                      <div className="notice-preview">{notice.content?.substring(0, 80)}...</div>
                    </td>
                    <td>
                      <span className="category-badge" style={{ backgroundColor: getCategoryColor(notice.category) }}>
                        {getCategoryLabel(notice.category)}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(notice.status) }}
                      >
                        {getStatusLabel(notice.status)}
                      </span>
                    </td>
                    <td>
                      {notice.important ? (
                        <span className="important-indicator">⭐ 중요</span>
                      ) : (
                        <span className="normal-indicator">일반</span>
                      )}
                    </td>
                    <td>{(notice.views || 0).toLocaleString()}</td>
                    <td>{notice.author || '관리자'}</td>
                    <td>{formatDate(notice.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(notice)}
                          className="edit-btn"
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(notice)}
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
            <h3>공지사항 삭제</h3>
            <p>"{selectedNotice?.title}" 공지사항을 삭제하시겠습니까?</p>
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

      {/* 공지사항 작성/수정 폼 */}
      {showForm && (
        <NoticeForm 
          notice={editingNotice}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingNotice(null);
          }}
        />
      )}
    </div>
  );
};

// 공지사항 작성/수정 폼 컴포넌트
const NoticeForm = ({ notice, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    category: notice?.category || 'important',
    isImportant: notice?.isImportant || false,
    status: notice?.status || 'draft'
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
        <h3>{notice ? '공지사항 수정' : '새 공지사항 작성'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="10"
              className="form-textarea"
              placeholder="공지사항 내용을 입력하세요"
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
                <option value="important">중요</option>
                <option value="event">이벤트</option>
                <option value="maintenance">점검</option>
                <option value="guide">가이드</option>
                <option value="update">업데이트</option>
              </select>
            </div>

            <div className="form-group">
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="draft">임시저장</option>
                <option value="published">발행</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isImportant"
                checked={formData.isImportant}
                onChange={handleInputChange}
              />
              중요 공지사항으로 설정
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="submit-btn">
              {notice ? '수정' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeAdmin; 