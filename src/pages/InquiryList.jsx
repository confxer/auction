import React, { useState, useMemo } from 'react';
import { useInquiryList, useUserInquiryList, useInquiryActions } from '../hooks/useInquiry';
import '../style/InquiryList.css';

const PAGE_SIZE = 10;

export default function InquiryList({ userId, isAdmin }) {
  const { inquiries, loading } = isAdmin ? useInquiryList() : useUserInquiryList(userId);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const { createInquiry, answerInquiry } = useInquiryActions();
  const [adminAnswer, setAdminAnswer] = useState('');
  const [adminStatus, setAdminStatus] = useState('답변완료');

  // 검색 필터링
  const filtered = useMemo(() => {
    if (!search) return inquiries;
    return inquiries.filter(i =>
      (i.title && i.title.includes(search)) ||
      (i.content && i.content.includes(search))
    );
  }, [inquiries, search]);

  // 페이지네이션
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 상태 컬러
  const statusColor = status => {
    if (status === '답변상태') return 'inquiry-status-answer';
    if (status === '문의상태') return 'inquiry-status-pending';
    return 'inquiry-status-done';
  };

  // 문의 등록
  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFormSubmit = async e => {
    e.preventDefault();
    await createInquiry({ userId, ...form });
    setForm({ title: '', content: '' });
    setShowForm(false);
    window.location.reload();
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="inquiry-table-container">
      <h2 className="inquiry-title">1:1문의</h2>
      <div className="inquiry-search-box">
        <input
          className="inquiry-search-input"
          placeholder="검색어를 입력해주세요"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="inquiry-search-icon">🔍</span>
      </div>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>날짜</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={4}>문의가 없습니다.</td></tr>
          ) : paged.map((inquiry, idx) => (
            <tr key={inquiry.id}>
              <td>{filtered.length - ((page - 1) * PAGE_SIZE + idx)}</td>
              <td>
                <span className="inquiry-link" onClick={() => setSelected(inquiry)}>{inquiry.title}</span>
              </td>
              <td>{inquiry.createdAt ? inquiry.createdAt.slice(0, 10) : '-'}</td>
              <td><span className={statusColor(inquiry.status)}>{inquiry.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 페이지네이션 */}
      <div className="inquiry-pagination">
        <button disabled={page === 1} onClick={() => setPage(1)}>{'<<'}</button>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{'<'}</button>
        {Array.from({ length: totalPage }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            className={num === page ? 'active' : ''}
            onClick={() => setPage(num)}
          >{num}</button>
        ))}
        <button disabled={page === totalPage} onClick={() => setPage(p => p + 1)}>{'>'}</button>
        <button disabled={page === totalPage} onClick={() => setPage(totalPage)}>{'>>'}</button>
      </div>
      {/* 상세 모달 */}
      {selected && (
        <div className="inquiry-modal-bg" onClick={() => setSelected(null)}>
          <div className="inquiry-modal" onClick={e => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <div className="inquiry-modal-date">{selected.createdAt ? selected.createdAt.slice(0, 10) : '-'}</div>
            <div className="inquiry-modal-content">{selected.content}</div>
            {selected.answer && (
              <div className="inquiry-modal-answer">
                <b>답변</b><br />{selected.answer}
              </div>
            )}
            {/* 관리자 답변/상태 입력 UI */}
            {isAdmin && (
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={adminAnswer}
                  onChange={e => setAdminAnswer(e.target.value)}
                  placeholder="답변을 입력하세요"
                  rows={4}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <div style={{ marginBottom: 8 }}>
                  <label>상태: </label>
                  <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)}>
                    <option value="답변완료">답변완료</option>
                    <option value="처리중">처리중</option>
                    <option value="대기">대기</option>
                  </select>
                </div>
                <button
                  className="inquiry-form-submit"
                  onClick={async () => {
                    await answerInquiry(selected.id, { answer: adminAnswer, status: adminStatus });
                    setSelected(null);
                    window.location.reload();
                  }}
                  style={{ marginRight: 8 }}
                >답변 등록/수정</button>
              </div>
            )}
            <button className="inquiry-modal-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
      {/* 문의하기 버튼 및 폼 */}
      {!isAdmin && !showForm && (
        <button className="inquiry-write-btn" onClick={() => setShowForm(true)}>문의하기</button>
      )}
      {!isAdmin && showForm && (
        <form className="inquiry-form-modal" onSubmit={handleFormSubmit}>
          <input name="title" value={form.title} onChange={handleFormChange} placeholder="제목" required />
          <textarea name="content" value={form.content} onChange={handleFormChange} placeholder="내용" required rows={5} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="inquiry-form-submit">등록</button>
            <button type="button" className="inquiry-form-cancel" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </form>
      )}
    </div>
  );
} 