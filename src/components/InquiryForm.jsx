import React, { useState } from 'react';
import '../style/InquiryForm.css';

const categories = ["경매", "배송", "환불/교환", "회원정보", "결제", "상품품질", "기술지원"];

const InquiryForm = ({ userId, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = category => {
    setForm(prev => ({ ...prev, category }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      alert("카테고리, 제목, 내용을 모두 입력해 주세요.");
      return;
    }
    onSubmit({ ...form, userId });
    setForm({ title: '', content: '', category: '' });
  };

  return (
    <form className="inquiry-form inquiry-form-row" onSubmit={handleSubmit}>
      {/* 카테고리 선택 */}
      <div className="inquiry-col category-col">
        <label>카테고리 <span className="required">*</span></label>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`category-btn ${form.category === cat ? 'selected' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 제목/내용 */}
      <div className="inquiry-col content-col">
        <label>제목 <span className="required">*</span></label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={100}
          required
          placeholder="제목을 입력하세요"
        />
        <label>문의 내용 <span className="required">*</span></label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          maxLength={2000}
          required
          placeholder="문의할 내용을 입력하세요"
        />
      </div>

      {/* 파일 첨부 (향후 구현) */}
      <div className="inquiry-col file-col">
        <label>파일 첨부</label>
        <div className="file-upload-box">
          <span className="file-upload-icon">📎</span>
          <span className="file-upload-desc">
            클릭하여 파일 선택 또는<br />여기로 끌어놓기
          </span>
          <div className="file-upload-info">
            JPG, PNG, PDF 등 최대 5개 / 10MB
          </div>
        </div>
      </div>

      {/* 작성 안내 */}
      <div className="inquiry-col guide-col">
        <label className="guide-title">문의 작성 안내</label>
        <ul className="guide-list">
          <li>문의는 구체적으로 작성해 주세요.</li>
          <li>개인정보는 입력하지 마세요.</li>
          <li>답변은 평균 1~2일 소요됩니다.</li>
          <li>긴급 시 고객센터 1588-1234로 연락 바랍니다.</li>
        </ul>
      </div>

      {/* 버튼 영역 */}
      <div className="inquiry-col btn-col">
        <button
          type="button"
          className="form-button cancel"
          onClick={onCancel}
        >
          취소
        </button>
        <button type="submit" className="form-button primary">
          문의 등록
        </button>
      </div>
    </form>
  );
};

export default InquiryForm;
