import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

const ReportPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    await axios.put(`/api/reports/${id}/status?status=${status}`);
    fetchReports();
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2>신고 관리</h2>
      {loading && <div>로딩중...</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>경매ID</th>
            <th>신고자</th>
            <th>사유</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.auctionId}</td>
              <td>{r.reporter}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'PENDING' ? (
                  <>
                    <button
                      style={{ background: '#7b5cff', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 12px', marginRight: 4, cursor: 'pointer' }}
                      onClick={() => handleStatus(r.id, 'APPROVED')}
                    >
                      승인(accept)
                    </button>
                    <button
                      style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 5, padding: '4px 12px', cursor: 'pointer' }}
                      onClick={() => handleStatus(r.id, 'REJECTED')}
                    >
                      반려(reject)
                    </button>
                  </>
                ) : (
                  <span style={{ color: r.status === 'APPROVED' ? '#4caf50' : '#e74c3c' }}>
                    {r.status === 'APPROVED' ? '승인됨' : '반려됨'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPanel; 