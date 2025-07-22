import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // "new" ID인 경우 이벤트 등록 페이지로 리다이렉트
    if (id === 'new') {
      navigate('/event-admin');
      return;
    }

    axios.get(`http://localhost:8080/api/event/${id}`, { withCredentials: true })
      .then(res => setEvent(res.data))
      .catch(e => setError(e.response?.data || e.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="event-detail">불러오는 중...</div>;
  if (error) return <div className="event-detail error">{error}</div>;
  if (!event) return null;

  return (
    <div className="event-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>← 목록으로</button>
      <h2>{event.title}</h2>
      <div className="event-date">{event.createdAt?.slice(0, 10)}</div>
      <div className="event-content">{event.content}</div>
    </div>
  );
};

export default EventDetail; 