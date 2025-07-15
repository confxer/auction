import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/CustomerService.css';

const CustomerService = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqs, setFaqs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // FAQ 데이터 로드
      const faqResponse = await axios.get('/api/faq/published');
      setFaqs(faqResponse.data || []);

      // 공지사항 데이터 로드
      const noticeResponse = await axios.get('/api/notice/published');
      setNotices(noticeResponse.data || []);

      // 이벤트 데이터 로드
      const eventResponse = await axios.get('/api/event/published');
      setEvents(eventResponse.data || []);

    } catch (err) {
      console.log('데이터 로드 실패:', err);
      // 샘플 데이터 생성 시도
      try {
        await axios.post('/api/faq/sample-data');
        await axios.post('/api/event/sample-data');
        loadData(); // 다시 로드
      } catch (sampleErr) {
        console.log('샘플 데이터 생성 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="cs-main">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="cs-main">
      <h2>고객센터</h2>
      
      {/* 탭 메뉴 */}
      <div className="cs-tabs">
        <button 
          className={activeTab === 'faq' ? 'active' : ''} 
          onClick={() => setActiveTab('faq')}
        >
          자주 묻는 질문 ({faqs.length})
        </button>
        <button 
          className={activeTab === 'notice' ? 'active' : ''} 
          onClick={() => setActiveTab('notice')}
        >
          공지사항 ({notices.length})
        </button>
        <button 
          className={activeTab === 'event' ? 'active' : ''} 
          onClick={() => setActiveTab('event')}
        >
          이벤트 ({events.length})
        </button>
        <button onClick={() => navigate('/inquiry')}>
          1:1 문의
        </button>
      </div>

      {/* FAQ 탭 */}
      {activeTab === 'faq' && (
        <div className="cs-content">
          <h3>자주 묻는 질문</h3>
          {faqs.length === 0 ? (
            <div className="empty-message">등록된 FAQ가 없습니다.</div>
          ) : (
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="faq-item">
                  <div 
                    className={`faq-question ${openFAQIndex === index ? 'open' : ''}`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="faq-icon">{openFAQIndex === index ? '▼' : '▶'}</span>
                    {faq.question}
                    {faq.important && <span className="important-badge">중요</span>}
                  </div>
                  {openFAQIndex === index && (
                    <div className="faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 공지사항 탭 */}
      {activeTab === 'notice' && (
        <div className="cs-content">
          <h3>공지사항</h3>
          {notices.length === 0 ? (
            <div className="empty-message">등록된 공지사항이 없습니다.</div>
          ) : (
            <div className="notice-list">
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item" onClick={() => navigate(`/notice/${notice.id}`)}>
                  <div className="notice-header">
                    <h4 className="notice-title">
                      {notice.important && <span className="important-badge">중요</span>}
                      {notice.title}
                    </h4>
                    <span className="notice-date">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="notice-excerpt">
                    {notice.content.length > 100 
                      ? notice.content.substring(0, 100) + '...' 
                      : notice.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 이벤트 탭 */}
      {activeTab === 'event' && (
        <div className="cs-content">
          <h3>이벤트</h3>
          {events.length === 0 ? (
            <div className="empty-message">진행중인 이벤트가 없습니다.</div>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <div key={event.id} className="event-item" onClick={() => navigate(`/event/${event.id}`)}>
                  <div className="event-header">
                    <h4 className="event-title">
                      {event.important && <span className="important-badge">중요</span>}
                      {event.title}
                    </h4>
                    <span className="event-date">
                      {new Date(event.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.endDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="event-excerpt">
                    {event.content.length > 100 
                      ? event.content.substring(0, 100) + '...' 
                      : event.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerService; 