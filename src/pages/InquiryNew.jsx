import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
import '../style/InquiryNew.css';

const InquiryNew = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    files: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      // navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="loading">로그인 확인 중...</div>;
  }

  const categories = [
    { id: 'auction', name: '경매', icon: '🔨' },
    { id: 'delivery', name: '배송', icon: '🚚' },
    { id: 'refund', name: '환불/교환', icon: '🔄' },
    { id: 'account', name: '회원정보', icon: '👤' },
    { id: 'payment', name: '결제', icon: '💳' },
    { id: 'quality', name: '상품품질', icon: '⭐' },
    { id: 'technical', name: '기술지원', icon: '🔧' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024;

    if (files.length > maxFiles) {
      alert(`최대 ${maxFiles}개까지 첨부 가능합니다.`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} 파일이 너무 큽니다. (최대 10MB)`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요.';
    else if (formData.title.trim().length < 5) newErrors.title = '제목은 5자 이상 입력해주세요.';
    if (!formData.content.trim()) newErrors.content = '문의 내용을 입력해주세요.';
    else if (formData.content.trim().length < 10) newErrors.content = '문의 내용은 10자 이상 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const inquiryData = {
        category: formData.category,
        title: formData.title,
        content: formData.content
      };
      await axios.post('/api/inquiry', inquiryData);
      alert('문의가 성공적으로 등록되었습니다.');
      navigate('/inquiry');
    } catch (error) {
      console.error('문의 등록 실패:', error);
      alert('문의 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="inquiry-new-page">
      <div className="inquiry-new-header">
        <div className="breadcrumb">
          <Link to="/">홈</Link>
          <span className="separator">›</span>
          <Link to="/inquiry">1:1 문의</Link>
          <span className="separator">›</span>
          <span className="current">문의 작성</span>
        </div>
        <h1>1:1 문의 작성</h1>
        <p>궁금한 점이나 문제가 있으시면 자세히 작성해 주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="inquiry-form">
        <div className="form-section">
          <label className="form-label">카테고리 <span className="required">*</span></label>
          <div className="category-grid">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                className={`category-option ${formData.category === category.id ? 'selected' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'category', value: category.id } })}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="title">제목 <span className="required">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="문의 제목을 입력해주세요"
            className={`form-input ${errors.title ? 'error' : ''}`}
            maxLength={100}
          />
          <div className="input-info">
            <span className="char-count">{formData.title.length}/100</span>
          </div>
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="content">문의 내용 <span className="required">*</span></label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="문의하실 내용을 자세히 작성해주세요."
            className={`form-textarea ${errors.content ? 'error' : ''}`}
            rows={10}
            maxLength={2000}
          />
          <div className="input-info">
            <span className="char-count">{formData.content.length}/2000</span>
          </div>
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-section">
          <label className="form-label">파일 첨부</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <div className="upload-icon">📎</div>
              <div className="upload-text">
                <p>클릭하거나 드래그하여 파일을 첨부하세요</p>
                <span>최대 5개, 파일당 10MB</span>
              </div>
            </label>
          </div>

          {formData.files.length > 0 && (
            <div className="file-list">
              {formData.files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} className="remove-file-btn">✖</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notice-section">
          <h3>문의 작성 안내</h3>
          <ul>
            <li>구체적으로 작성해주시면 더 정확한 답변을 드릴 수 있습니다.</li>
            <li>개인정보는 입력하지 마세요.</li>
            <li>1-2일 내 답변드립니다.</li>
            <li>긴급 시 고객센터 1588-1234로 연락 바랍니다.</li>
          </ul>
        </div>

        <div className="form-actions">
          <Link to="/inquiry" className="cancel-button">취소</Link>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '문의 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InquiryNew;