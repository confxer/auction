import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/InquiryAdminPanel.css';

const ADMIN_HEADER = { 'X-ADMIN': 'true' };

const InquiryAdminPanel = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchInquiries = () => {
    setLoading(true);
    fetch('/api/inquiry/all', { headers: ADMIN_HEADER })
      .then(res => {
        if (!res.ok) throw new Error('문의 불러오기 실패');
        return res.json();
      })
      .then(setInquiries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleDelete = id => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`/api/inquiry/${id}`, { method: 'DELETE', headers: ADMIN_HEADER })
      .then(res => {
        if (!res.ok) throw new Error('삭제 실패');
        fetchInquiries();
      })
      .catch(e => setError(e.message));
  };

  return (
    <div className="inquiry-admin-panel">
      <h3>전체 1:1 문의</h3>
      <ul className="inquiry-admin-list">
        {inquiries.length === 0 ? (
          <li>등록된 문의가 없습니다.</li>
        ) : (
          inquiries.map(inquiry => (
            <li key={inquiry.id}>
              <span className="inquiry-title">{inquiry.title}</span>
              <span className="inquiry-user">{inquiry.userId}</span>
              <span className="inquiry-date">{inquiry.createdAt?.slice(0, 10)}</span>
              <button onClick={() => navigate(`/inquiry/admin/${inquiry.id}`)}>상세/답변</button>
              <button className="delete" onClick={() => handleDelete(inquiry.id)}>삭제</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default InquiryAdminPanel; 