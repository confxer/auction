import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/event')
      .then((res) => {
        if (!res.ok) throw new Error('이벤트 불러오기 실패');
        return res.json();
      })
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="event-list">불러오는 중...</div>;
  if (error) return <div className="event-list error">{error}</div>;

  return (
    <div className="event-list">
      <h2>이벤트</h2>
      <ul>
        {events.length === 0 ? (
          <li>등록된 이벤트가 없습니다.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="event-item" onClick={() => navigate(`/event/${event.id}`)}>
              <div className="event-title">{event.title}</div>
              <div className="event-date">{event.createdAt?.slice(0, 10)}</div>
              <div className="event-content">{event.content.length > 40 ? event.content.slice(0, 40) + '...' : event.content}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EventList; 