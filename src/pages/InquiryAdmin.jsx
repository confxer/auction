// InquiryAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import '../style/InquiryAdmin.css';

const InquiryAdmin = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get('/api/inquiry/admin');
      setInquiries(res.data);
    } catch (err) {
      console.error('문의 목록 불러오기 실패:', err);
    }
  };

  const openReplyModal = (inquiry, edit = false) => {
    setSelectedInquiry(inquiry);
    setReplyContent(edit ? inquiry.answer : '');
    setEditMode(edit);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedInquiry(null);
    setReplyContent('');
    setEditMode(false);
  };

  const submitReply = async () => {
    try {
      const url = `/api/inquiry/${selectedInquiry.id}/answer`;
      await axios.post(url, { answer: replyContent });
      logAction(`답변 ${editMode ? '수정' : '작성'} 완료`);
      closeReplyModal();
      fetchInquiries();
    } catch (err) {
      console.error('답변 실패:', err);
    }
  };

  const logAction = (action) => {
    const timestamp = new Date().toLocaleString();
    setLogs(prev => [...prev, `[${timestamp}] ${action} - ${selectedInquiry?.title}`]);
  };

  return (
    <div className="inquiry-admin">
      <h1>📮 문의 관리</h1>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>상태</th>
            <th>내용</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <td>{inq.id}</td>
              <td>{inq.title}</td>
              <td>{inq.writer || '익명'}</td>
              <td>{inq.status}</td>
              <td>
                <a href="#" onClick={() => alert(inq.content)}>내용 보기</a>
              </td>
              <td>
                {inq.status !== 'completed' ? (
                  <button onClick={() => openReplyModal(inq)}>답변</button>
                ) : (
                  <button onClick={() => openReplyModal(inq, true)}>수정</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {replyModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editMode ? '답변 수정' : '답변 작성'}</h2>
            <p><strong>제목:</strong> {selectedInquiry.title}</p>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답변 내용을 입력하세요"
            />
            <div className="modal-actions">
              <button onClick={submitReply}>{editMode ? '수정 완료' : '답변 등록'}</button>
              <button onClick={closeReplyModal}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <div className="log-section">
        <h2>🧾 문의 이력 로그</h2>
        <ul>
          {logs.map((log, idx) => (
            <li key={idx}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InquiryAdmin;
