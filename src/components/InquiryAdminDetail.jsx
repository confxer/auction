import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrivateMessage from './PrivateMessage';
import '../style/InquiryAdminDetail.css';

const InquiryAdminDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // "new" ID인 경우 문의 등록 페이지로 리다이렉트
    if (id === 'new') {
      navigate('/inquiry-new');
      return;
    }

    fetch(`/api/inquiry/${id}`)
      .then(res => res.json())
      .then(setInquiry);
  }, [id, navigate]);

  if (!inquiry) return <div>불러오는 중...</div>;

  return (
    <div className="inquiry-admin-detail">
      <h2>{inquiry.title}</h2>
      <div className="inquiry-date">{inquiry.createdAt?.slice(0, 10)}</div>
      <div className="inquiry-content">{inquiry.content}</div>
      <button onClick={() => setShowMessage(true)}>쪽지로 답변</button>
      {showMessage && (
        <PrivateMessage
          currentUser="admin"
          targetUser={inquiry.userId}
          onClose={() => setShowMessage(false)}
        />
      )}
    </div>
  );
};

export default InquiryAdminDetail; 