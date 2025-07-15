import React, { useEffect, useState } from 'react';
import '../style/FAQList.css';

const FAQList = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/faq')
      .then((res) => {
        if (!res.ok) throw new Error('FAQ 불러오기 실패');
        return res.json();
      })
      .then(setFaqs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="faq-list">불러오는 중...</div>;
  if (error) return <div className="faq-list error">{error}</div>;

  return (
    <div className="faq-list">
      <h2>자주 묻는 질문(FAQ)</h2>
      <ul>
        {faqs.length === 0 ? (
          <li>등록된 FAQ가 없습니다.</li>
        ) : (
          faqs.map((faq) => (
            <li key={faq.id} className="faq-item">
              <div className="faq-question">Q. {faq.question}</div>
              <div className="faq-answer">A. {faq.answer}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FAQList; 