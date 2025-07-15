import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from '../axiosConfig';
// import '../style/InquiryMy.css'; // 스타일 분리 시 사용

const InquiryMy = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      // navigate('/login');
      return;
    }
    
    loadMyInquiries();
  }, [user, navigate]);

  const loadMyInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/inquiry/my');
      const apiInquiries = response.data;
      
      // 응답이 배열인지 확인하고 안전하게 설정
      if (Array.isArray(apiInquiries)) {
        setInquiries(apiInquiries);
      } else {
        console.warn('API 응답이 배열이 아닙니다:', apiInquiries);
        setInquiries([]);
      }
    } catch (error) {
      console.error('내 문의 로드 실패:', error);
      setError('문의 내역을 불러오는데 실패했습니다.');
      
      // API 실패 시 임시 데이터 사용
      setInquiries([
        {
          id: 1,
          category: '배송',
          title: '배송이 너무 늦어요',
          createdAt: '2024-07-10',
          status: '답변완료',
        },
        {
          id: 2,
          category: '결제',
          title: '결제 취소 문의',
          createdAt: '2024-07-08',
          status: '처리중',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inquiry-my-page" style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: '1.7rem', fontWeight: 700, marginBottom: 24}}>내 1:1 문의 내역</h1>
      {loading ? (
        <div className="loading" style={{textAlign: 'center', padding: 40}}>
          <div className="spinner" style={{marginBottom: 12}}></div>
          불러오는 중...
        </div>
      ) : error ? (
        <div className="error" style={{color: '#e74c3c', textAlign: 'center'}}>
          오류가 발생했습니다. 새로고침 해주세요.
        </div>
      ) : inquiries.length === 0 ? (
        <div className="no-inquiry" style={{textAlign: 'center', color: '#888', padding: 40}}>
          <div style={{fontSize: 32, marginBottom: 10}}>📭</div>
          등록된 1:1 문의가 없습니다.<br/>
          <Link to="/inquiry/new" style={{color: '#1976d2', textDecoration: 'underline'}}>문의 작성하기</Link>
        </div>
      ) : (
        <table className="inquiry-table" style={{width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'}}>
          <thead style={{background: '#f4f6fa'}}>
            <tr>
              <th style={{padding: '14px 8px', fontWeight: 600, color: '#1976d2'}}>카테고리</th>
              <th style={{padding: '14px 8px', fontWeight: 600}}>제목</th>
              <th style={{padding: '14px 8px', fontWeight: 600}}>등록일</th>
              <th style={{padding: '14px 8px', fontWeight: 600}}>상태</th>
              <th style={{padding: '14px 8px', fontWeight: 600}}></th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inq => (
              <tr key={inq.id} style={{borderBottom: '1px solid #f0f0f0'}}>
                <td style={{padding: '12px 8px', textAlign: 'center'}}>{inq.category}</td>
                <td style={{padding: '12px 8px'}}>
                  <Link to={`/inquiry/${inq.id}`} style={{color: '#1976d2', textDecoration: 'underline'}}>{inq.title}</Link>
                </td>
                <td style={{padding: '12px 8px', textAlign: 'center'}}>{inq.createdAt}</td>
                <td style={{padding: '12px 8px', textAlign: 'center'}}>{inq.status}</td>
                <td style={{padding: '12px 8px', textAlign: 'center'}}>
                  <Link to={`/inquiry/${inq.id}`} style={{color: '#555', fontSize: 15}}>상세보기</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 간단 스타일: 실무에선 별도 CSS로 분리 */}
      <style>{`
        .spinner { width: 24px; height: 24px; border: 3px solid #eee; border-top: 3px solid #1976d2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        .inquiry-table th, .inquiry-table td { border-bottom: 1px solid #f0f0f0; }
        .inquiry-table th { background: #f4f6fa; }
        .inquiry-table tr:last-child td { border-bottom: none; }
        .inquiry-table a:hover { color: #125ea7; }
      `}</style>
    </div>
  );
};

export default InquiryMy; 