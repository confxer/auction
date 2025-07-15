import React, { useEffect, useState } from 'react';
import FAQAdminForm from './FAQAdminForm';
import '../style/FAQAdminPanel.css';

const ADMIN_HEADER = { 'X-ADMIN': 'true' };

const FAQAdminPanel = () => {
  const [faqs, setFaqs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FAQ 목록 불러오기
  const fetchFaqs = () => {
    setLoading(true);
    fetch('/api/faq')
      .then((res) => {
        if (!res.ok) throw new Error('FAQ 불러오기 실패');
        return res.json();
      })
      .then(setFaqs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // 등록/수정
  const handleSubmit = (faq) => {
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? `/api/faq/${selected.id}` : '/api/faq';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...ADMIN_HEADER },
      body: JSON.stringify(faq),
    })
      .then((res) => {
        if (!res.ok) throw new Error('저장 실패: ' + res.statusText);
        fetchFaqs();
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  };

  // 삭제
  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`/api/faq/${id}`, { method: 'DELETE', headers: ADMIN_HEADER })
      .then((res) => {
        if (!res.ok) throw new Error('삭제 실패: ' + res.statusText);
        fetchFaqs();
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  };

  if (loading) return <div className="faq-admin-panel">불러오는 중...</div>;
  if (error) return <div className="faq-admin-panel error">{error}</div>;

  return (
    <div className="faq-admin-panel">
      <FAQAdminForm
        selectedFAQ={selected}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onCancel={() => setSelected(null)}
      />
      <h3>FAQ 목록</h3>
      <ul className="faq-admin-list">
        {faqs.length === 0 ? (
          <li>등록된 FAQ가 없습니다.</li>
        ) : (
          faqs.map((faq) => (
            <li key={faq.id}>
              <span className="faq-q">Q. {faq.question}</span>
              <span className="faq-a">A. {faq.answer}</span>
              <button onClick={() => setSelected(faq)}>수정</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FAQAdminPanel; 