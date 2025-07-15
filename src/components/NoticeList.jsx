import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/NoticeList.css';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 사용자 페이지에서는 published 상태의 공지사항만 가져옴
    fetch('/api/notice/published')
      .then((res) => {
        if (!res.ok) throw new Error('공지사항 불러오기 실패');
        return res.json();
      })
      .then(setNotices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="notice-list">불러오는 중...</div>;
  if (error) return <div className="notice-list error">{error}</div>;

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
              <div className="notice-date">{notice.createdAt?.slice(0, 10)}</div>
              <div className="notice-content">{notice.content.length > 40 ? notice.content.slice(0, 40) + '...' : notice.content}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NoticeList; 