import React, { useState } from 'react';
import axios from '../axiosConfig';

const ReportButton = ({ auctionId }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!reason) return setMessage('신고 사유를 선택하세요.');
    await axios.post('/api/reports', {
      auctionId,
      reporter: '현재유저', // 실제 로그인 유저로 대체
      reason: reason + (detail ? `: ${detail}` : ''),
      status: 'PENDING'
    });
    setMessage('신고가 접수되었습니다.');
    setOpen(false);
    setReason('');
    setDetail('');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}>🚨 신고하기</button>
      {open && (
        <div className="report-modal-overlay" onClick={() => setOpen(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>경매 신고</h3>
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 6, borderRadius: 4 }}>
              <option value="">신고 사유 선택</option>
              <option value="허위">허위</option>
              <option value="사기">사기</option>
              <option value="기타">기타</option>
            </select>
            <textarea
              placeholder="상세 사유(선택)"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              style={{ width: '100%', minHeight: 60, marginBottom: 8, borderRadius: 4, padding: 6 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: 10, background: '#7b5cff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                신고 제출
              </button>
              <button onClick={() => setOpen(false)} style={{ flex: 1, padding: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                취소
              </button>
            </div>
            {message && <div style={{ marginTop: 8, color: '#4caf50' }}>{message}</div>}
          </div>
        </div>
      )}
      <style>{`
        .report-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .report-modal {
          background: #fff;
          border-radius: 12px;
          padding: 28px 20px 20px 20px;
          min-width: 320px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.13);
        }
      `}</style>
    </>
  );
};

export default ReportButton; 