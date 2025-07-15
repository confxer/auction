import React, { useState } from 'react';
import '../style/InquiryForm.css';

const InquiryForm = ({ userId, onSubmit }) => {
  const [form, setForm] = useState({ title: '', content: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit({ ...form, userId });
    setForm({ title: '', content: '' });
  };

  return (
    <form className="inquiry-form inquiry-form-row" onSubmit={handleSubmit}>
      {/* 카테고리 영역 (예시 버튼) */}
      <div className="inquiry-col category-col">
        <label>카테고리 <span className="required">*</span></label>
        <button type="button" className="category-btn">경매</button>
        <button type="button" className="category-btn">배송</button>
        <button type="button" className="category-btn">환불/교환</button>
        <button type="button" className="category-btn">회원정보</button>
        <button type="button" className="category-btn">결제</button>
        <button type="button" className="category-btn">상품품질</button>
        <button type="button" className="category-btn">기술지원</button>
      </div>
      {/* 제목/내용 */}
      <div className="inquiry-col content-col">
        <label>제목 <span className="required">*</span></label>
        <input name="title" value={form.title} onChange={handleChange} required maxLength={100} />
        <label>문의 내용 <span className="required">*</span></label>
        <textarea name="content" value={form.content} onChange={handleChange} required maxLength={2000} />
      </div>
      {/* 파일 첨부 */}
      <div className="inquiry-col file-col">
        <label>파일 첨부</label>
        <div className="file-upload-box">
          <span className="file-upload-icon">⬇️</span>
          <span className="file-upload-desc">클릭하여 파일을 선택하거나<br/>여기로 파일을 끌어놓으세요</span>
          <div className="file-upload-info">지원 형식: JPG, PNG, PDF, DOC, DOCX, TXT<br/>최대 10MB, 최대 5개</div>
        </div>
      </div>
      {/* 안내 */}
      <div className="inquiry-col guide-col">
        <label className="guide-title">문의 작성 안내</label>
        <ul className="guide-list">
          <li>문의 내용은 구체적으로 작성해주시면 더 정확한 답변을 드릴 수 있습니다.</li>
          <li>개인정보(주민등록번호, 계좌번호 등)는 절대 입력하지 마세요.</li>
          <li>답변은 1~2일 내에 등록해드립니다.</li>
          <li>긴급한 문의는 고객센터(1588-1234)로 연락해 주세요.</li>
        </ul>
      </div>
      {/* 버튼 */}
      <div className="inquiry-col btn-col">
        <button type="button" className="cancel-btn">취소</button>
        <button type="submit" className="submit-btn">문의 등록</button>
      </div>
    </form>
  );
};

export default InquiryForm; 