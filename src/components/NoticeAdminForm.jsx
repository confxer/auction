import React, { useState, useEffect } from 'react';
import '../style/NoticeAdminForm.css';

const initialState = { 
  title: '', 
  content: '', 
  category: 'general',
  status: 'published',
  isImportant: false
};

const NoticeAdminForm = ({ selectedNotice, onSubmit, onDelete, onCancel }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (selectedNotice) setForm(selectedNotice);
    else setForm(initialState);
  }, [selectedNotice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit(form);
    setForm(initialState);
  };

  return (
    <form className="notice-admin-form" onSubmit={handleSubmit}>
      <h3>{selectedNotice ? '공지 수정' : '공지 등록'}</h3>
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
      <div>
        <label>카테고리</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="general">일반</option>
          <option value="important">중요</option>
          <option value="event">이벤트</option>
          <option value="maintenance">점검</option>
          <option value="update">업데이트</option>
        </select>
      </div>
      <div>
        <label>상태</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="published">발행</option>
          <option value="draft">임시저장</option>
        </select>
      </div>
      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isImportant"
            checked={form.isImportant}
            onChange={handleChange}
          />
          중요 공지사항
        </label>
      </div>
      <div className="notice-admin-form-btns">
        <button type="submit">{selectedNotice ? '수정' : '등록'}</button>
        {selectedNotice && (
          <button type="button" className="delete" onClick={() => onDelete(selectedNotice.id)}>
            삭제
          </button>
        )}
        <button type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
};

export default NoticeAdminForm; 