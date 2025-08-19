import React, { useState, useMemo } from 'react';
import { useUserInquiryList, useInquiryActions } from '../hooks/useInquiry';
import '../style/InquiryList.css';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function InquiryList({ onSelect }) {
  const { user } = useUser();
  const { inquiries, loading } = useUserInquiryList(user?.id);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const { createInquiry } = useInquiryActions();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!search) return inquiries;
    return inquiries.filter(i =>
      (i.title && i.title.includes(search)) ||
      (i.content && i.content.includes(search))
    );
  }, [inquiries, search]);

  useEffect( () => {
    if(!user){
      navigate('/login');
    }
  },[]);

  const totalPage = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusColor = status => {
    if (status === '답변상태') return 'inquiry-status-answer';
    if (status === '문의상태') return 'inquiry-status-pending';
    return 'inquiry-status-done';
  };

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async e => {
    e.preventDefault();
    await createInquiry({ userId: user?.id, ...form });
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
                <span className="inquiry-link" onClick={() => onSelect(inquiry.id)}>
                  {inquiry.title}
                </span>
              </td>
              <td>{inquiry.createdAt ? inquiry.createdAt.slice(0, 10) : '-'}</td>
              <td><span className={statusColor(inquiry.status)}>{inquiry.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

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

      {!showForm && (
        <button className="inquiry-write-btn" onClick={() => setShowForm(true)}>문의하기</button>
      )}
      {showForm && (
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
