import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/Notice.css';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notice/published');
      setNotices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
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
    return <div className="notice-list">로딩 중...</div>;
  }

  return (
    <div className="notice-list">
      <h2>공지사항</h2>
      <ul>
        {notices.length === 0 ? (
          <li>등록된 공지사항이 없습니다.</li>
        ) : (
          notices.map((notice) => (
            <li key={notice.id} className="notice-item" onClick={() => navigate(`/notice/${notice.id}`)}>
              <div className="notice-title">{notice.title}</div>
              <div className="notice-date">{formatDate(notice.createdAt)}</div>
              <div className="notice-content">{notice.content.length > 40 ? notice.content.slice(0, 40) + '...' : notice.content}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Notice;
