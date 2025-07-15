import React, { useState, useEffect } from 'react';
import '../style/EventAdminForm.css';

const initialState = { title: '', content: '' };

const EventAdminForm = ({ selectedEvent, onSubmit, onDelete, onCancel }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (selectedEvent) setForm(selectedEvent);
    else setForm(initialState);
  }, [selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit(form);
    setForm(initialState);
  };

  return (
    <form className="event-admin-form" onSubmit={handleSubmit}>
      <h3>{selectedEvent ? '이벤트 수정' : '이벤트 등록'}</h3>
      <div>
        <label>제목</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>내용</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          required
        />
      </div>
      <div className="event-admin-form-btns">
        <button type="submit">{selectedEvent ? '수정' : '등록'}</button>
        {selectedEvent && (
          <button type="button" className="delete" onClick={() => onDelete(selectedEvent.id)}>
            삭제
          </button>
        )}
        <button type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
};

export default EventAdminForm; 