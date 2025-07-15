import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/Notice.css';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, [currentPage, filterType]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // 사용자 페이지에서는 published 상태의 공지사항만 가져옴
      const response = await axios.get('/api/notice/published');
      const data = Array.isArray(response.data) ? response.data : [];
      
      // 필터링 적용
      let filteredData = data;
      if (filterType !== 'all') {
        filteredData = data.filter(notice => notice.category === filterType);
      }
      if (searchTerm) {
        filteredData = filteredData.filter(notice => 
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setNotices(filteredData);
      setTotalPages(Math.ceil(filteredData.length / 10));
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotices();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return <div className="notice-page">로딩 중...</div>;
  }

  return (
    <div className="notice-page">
      <div className="notice-header">
        <h1>공지사항</h1>
        <p>몬스터옥션의 최신 소식을 확인하세요</p>
      </div>

      <div className="notice-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="공지사항 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">검색</button>
        </form>

        <div className="filter-buttons">
          <button
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => setFilterType('all')}
          >
            전체
          </button>
          <button
            className={filterType === 'important' ? 'active' : ''}
            onClick={() => setFilterType('important')}
          >
            중요
          </button>
          <button
            className={filterType === 'event' ? 'active' : ''}
            onClick={() => setFilterType('event')}
          >
            이벤트
          </button>
          <button
            className={filterType === 'update' ? 'active' : ''}
            onClick={() => setFilterType('update')}
          >
            업데이트
          </button>
        </div>
      </div>

      <div className="notice-list">
        {notices.length === 0 ? (
          <div className="no-notices">
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="notice-item">
              <div className="notice-content">
                <h3 className="notice-title" onClick={() => setSelectedNotice(notice)}>
                  {notice.isImportant && <span className="important-badge">중요</span>}
                  {notice.title}
                </h3>
                <p className="notice-excerpt">
                  {notice.content.length > 100 
                    ? notice.content.substring(0, 100) + '...' 
                    : notice.content}
                </p>
                <div className="notice-meta">
                  <span className="notice-date">{formatDate(notice.createdAt)}</span>
                  <span className="notice-category">{notice.category}</span>
                  <span className="notice-views">조회수: {notice.views || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {/* 공지사항 상세 모달 */}
      {selectedNotice && (
        <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotice.title}</h2>
              <button className="modal-close" onClick={() => setSelectedNotice(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="notice-detail-meta">
                <span>작성일: {formatDate(selectedNotice.createdAt)}</span>
                <span>카테고리: {selectedNotice.category}</span>
                <span>조회수: {selectedNotice.views || 0}</span>
              </div>
              <div className="notice-detail-content">
                {selectedNotice.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notice;
