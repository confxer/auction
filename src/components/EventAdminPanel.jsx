import React, { useEffect, useState } from 'react';
import EventAdminForm from './EventAdminForm';
import '../style/EventAdminPanel.css';

const ADMIN_HEADER = { 'X-ADMIN': 'true' };

const EventAdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 이벤트 목록 불러오기
  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/event')
      .then((res) => {
        if (!res.ok) throw new Error('이벤트 불러오기 실패');
        return res.json();
      })
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 등록/수정
  const handleSubmit = (event) => {
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? `/api/event/${selected.id}` : '/api/event';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...ADMIN_HEADER },
      body: JSON.stringify(event),
    })
      .then((res) => {
        if (!res.ok) throw new Error('저장 실패: ' + res.statusText);
        fetchEvents();
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  };

  // 삭제
  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`/api/event/${id}`, { method: 'DELETE', headers: ADMIN_HEADER })
      .then((res) => {
        if (!res.ok) throw new Error('삭제 실패: ' + res.statusText);
        fetchEvents();
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  };

  if (loading) return <div className="event-admin-panel">불러오는 중...</div>;
  if (error) return <div className="event-admin-panel error">{error}</div>;

  return (
    <div className="event-admin-panel">
      <EventAdminForm
        selectedEvent={selected}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onCancel={() => setSelected(null)}
      />
      <h3>이벤트 목록</h3>
      <ul className="event-admin-list">
        {events.length === 0 ? (
          <li>등록된 이벤트가 없습니다.</li>
        ) : (
          events.map((event) => (
            <li key={event.id}>
              <span className="event-title">{event.title}</span>
              <span className="event-date">{event.createdAt?.slice(0, 10)}</span>
              <button onClick={() => setSelected(event)}>수정</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EventAdminPanel; 