import React, { useState } from 'react';
import { useFAQList } from '../hooks/useFAQ';
import '../style/FAQList.css';

export default function FAQList() {
  const { faqs, loading } = useFAQList();
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleOpen = idx => {
    setOpenIndexes(openIndexes.includes(idx)
      ? openIndexes.filter(i => i !== idx)
      : [...openIndexes, idx]);
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="faq-accordion-container">
      <h2 className="faq-title">경매대장 FAQ</h2>
      <div className="faq-accordion-list">
        {faqs.length === 0 ? (
          <div className="faq-empty">FAQ가 없습니다.</div>
        ) : faqs.map((faq, idx) => (
          <div className="faq-accordion-item" key={faq.id}>
            <div
              className={`faq-accordion-question${openIndexes.includes(idx) ? ' open' : ''}`}
              onClick={() => toggleOpen(idx)}
            >
              <span className="faq-q-icon">{openIndexes.includes(idx) ? '▼' : '▶'}</span>
              {faq.question}
            </div>
            {openIndexes.includes(idx) && (
              <div className="faq-accordion-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 