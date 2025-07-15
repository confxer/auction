import React, { useState, useMemo } from 'react';
import { useNoticeList } from '../hooks/useNotice';
import '../style/NoticeList.css';

const PAGE_SIZE = 10;

export default function NoticeList() {
  const { notices, loading } = useNoticeList();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // 검색 필터링
  const filtered = useMemo(() => {
    if (!search) return notices;
    return notices.filter(n =>
      (n.title && n.title.includes(search)) ||
      (n.content && n.content.includes(search))
    );
  }, [notices, search]);

  // 페이지네이션
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="notice-table-container">
      <h2 className="notice-title">공지사항</h2>
      <div className="notice-search-box">
        <input
          className="notice-search-input"
          placeholder="검색어를 입력해주세요"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="notice-search-icon">🔍</span>
      </div>
      <table className="notice-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={3}>공지사항이 없습니다.</td></tr>
          ) : paged.map((notice, idx) => (
            <tr key={notice.id}>
              <td>{filtered.length - ((page - 1) * PAGE_SIZE + idx)}</td>
              <td>
                <span className="notice-link" onClick={() => setSelected(notice)}>{notice.title}</span>
              </td>
              <td>{notice.createdAt ? notice.createdAt.slice(0, 10) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 페이지네이션 */}
      <div className="notice-pagination">
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
        <div className="notice-modal-bg" onClick={() => setSelected(null)}>
          <div className="notice-modal" onClick={e => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <div className="notice-modal-date">{selected.createdAt ? selected.createdAt.slice(0, 10) : '-'}</div>
            <div className="notice-modal-content">{selected.content}</div>
            <button className="notice-modal-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 