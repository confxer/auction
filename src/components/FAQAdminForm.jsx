import React, { useState, useEffect } from 'react';
import '../style/FAQAdminForm.css';

const initialState = { question: '', answer: '' };

const FAQAdminForm = ({ selectedFAQ, onSubmit, onDelete, onCancel }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (selectedFAQ) setForm(selectedFAQ);
    else setForm(initialState);
  }, [selectedFAQ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    onSubmit(form);
    setForm(initialState);
  };

  return (
    <form className="faq-admin-form" onSubmit={handleSubmit}>
      <h3>{selectedFAQ ? 'FAQ 수정' : 'FAQ 등록'}</h3>
      <div>
        <label>질문</label>
        <input
          name="question"
          value={form.question}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>답변</label>
        <textarea
          name="answer"
          value={form.answer}
          onChange={handleChange}
          required
        />
      </div>
      <div className="faq-admin-form-btns">
        <button type="submit">{selectedFAQ ? '수정' : '등록'}</button>
        {selectedFAQ && (
          <button type="button" className="delete" onClick={() => onDelete(selectedFAQ.id)}>
            삭제
          </button>
        )}
        <button type="button" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
};

export default FAQAdminForm; 