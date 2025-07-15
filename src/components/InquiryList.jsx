import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/InquiryList.css';

const InquiryList = ({ userId }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/inquiry/my/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('문의 불러오기 실패');
        return res.json();
      })
      .then(setInquiries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="inquiry-list">불러오는 중...</div>;
  if (error) return <div className="inquiry-list error">{error}</div>;

  return (
    <div className="inquiry-list">
      <h2>내 1:1 문의</h2>
      <ul>
        {inquiries.length === 0 ? (
          <li>등록된 문의가 없습니다.</li>
        ) : (
          inquiries.map(inquiry => (
            <li key={inquiry.id} className="inquiry-item" onClick={() => navigate(`/inquiry/${inquiry.id}`)}>
              <div className="inquiry-title">{inquiry.title}</div>
              <div className="inquiry-date">{inquiry.createdAt?.slice(0, 10)}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default InquiryList; 