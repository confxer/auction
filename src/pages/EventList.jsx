import React, { useState, useMemo } from 'react';
import { useEventList } from '../hooks/useEvent';
import '../style/EventList.css';

const PAGE_SIZE = 10;

export default function EventList() {
  const { events, loading } = useEventList();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // 검색 필터링
  const filtered = useMemo(() => {
    if (!search) return events;
    return events.filter(e =>
      (e.title && e.title.includes(search)) ||
      (e.content && e.content.includes(search))
    );
  }, [events, search]);

  // 페이지네이션
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="event-table-container">
      <h2 className="event-title">이벤트</h2>
      <div className="event-search-box">
        <input
          className="event-search-input"
          placeholder="검색어를 입력해주세요"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="event-search-icon">🔍</span>
      </div>
      <table className="event-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={5}>이벤트가 없습니다.</td></tr>
          ) : paged.map((event, idx) => (
            <tr key={event.id}>
              <td>{filtered.length - ((page - 1) * PAGE_SIZE + idx)}</td>
              <td>
                <span className="event-link" onClick={() => setSelected(event)}>{event.title}</span>
              </td>
              <td>{event.startDate || '-'}</td>
              <td>{event.endDate || '-'}</td>
              <td>{event.createdAt ? event.createdAt.slice(0, 10) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 페이지네이션 */}
      <div className="event-pagination">
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
        <div className="event-modal-bg" onClick={() => setSelected(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <div className="event-modal-date">{selected.startDate} ~ {selected.endDate}</div>
            <div className="event-modal-content">{selected.content}</div>
            <button className="event-modal-close" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 