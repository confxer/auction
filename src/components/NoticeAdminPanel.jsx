import React, { useEffect, useState } from 'react';
import NoticeAdminForm from './NoticeAdminForm';
import '../style/NoticeAdminPanel.css';

const ADMIN_HEADER = { 'X-ADMIN': 'true' };

const NoticeAdminPanel = () => {
  const [notices, setNotices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 공지 목록 불러오기 (관리자 API 사용)
  const fetchNotices = () => {
    setLoading(true);
    console.log('📋 공지사항 목록 요청: /api/notice/admin');
    
    fetch('/api/notice/admin')
      .then((res) => {
        console.log('📡 목록 응답:', res.status, res.statusText);
        if (!res.ok) {
          return res.text().then(text => {
            console.error('❌ 목록 오류:', text);
            throw new Error('공지사항 불러오기 실패: ' + text);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('✅ 목록 성공:', data);
        setNotices(data);
      })
      .catch((e) => {
        console.error('❌ 목록 실패:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 등록/수정 (관리자 API 사용)
  const handleSubmit = (notice) => {
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? '/api/notice/admin' : '/api/notice/admin';
    
    console.log('🚀 공지사항 저장 요청:', { method, url, notice });
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...ADMIN_HEADER },
      body: JSON.stringify(notice),
    })
      .then((res) => {
        console.log('📡 서버 응답:', res.status, res.statusText);
        if (!res.ok) {
          return res.text().then(text => {
            console.error('❌ 서버 오류:', text);
            throw new Error('저장 실패: ' + res.statusText + ' - ' + text);
          });
        }
        return res.text();
      })
      .then((text) => {
        console.log('✅ 저장 성공:', text);
        fetchNotices();
        setSelected(null);
      })
      .catch((e) => {
        console.error('❌ 저장 실패:', e);
        setError(e.message);
      });
  };

  // 삭제 (관리자 API 사용)
  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`/api/notice/admin/${id}`, { method: 'DELETE', headers: ADMIN_HEADER })
      .then((res) => {
        if (!res.ok) throw new Error('삭제 실패: ' + res.statusText);
        fetchNotices();
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  };

  if (loading) return <div className="notice-admin-panel">불러오는 중...</div>;
  if (error) return <div className="notice-admin-panel error">{error}</div>;

  return (
    <div className="notice-admin-panel">
      <NoticeAdminForm
        selectedNotice={selected}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onCancel={() => setSelected(null)}
      />
      <h3>공지사항 목록</h3>
      <ul className="notice-admin-list">
        {notices.length === 0 ? (
          <li>등록된 공지사항이 없습니다.</li>
        ) : (
          notices.map((notice) => (
            <li key={notice.id}>
              <span className="notice-title">{notice.title}</span>
              <span className="notice-status">{notice.status}</span>
              <span className="notice-date">{notice.createdAt?.slice(0, 10)}</span>
              <button onClick={() => setSelected(notice)}>수정</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NoticeAdminPanel; 