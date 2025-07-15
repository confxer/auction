import React from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    // 로그인 안 했으면 홈으로 이동
    navigate('/');
    return null;
  }

  return (
    <div className="mypage-container" style={{ maxWidth: 480, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2 style={{ marginBottom: 16 }}>마이페이지</h2>
      <div style={{ marginBottom: 12, fontSize: '1.1em' }}>
        <strong>{user.nickname || user.name}</strong>님, 환영합니다!
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: '#888' }}>이메일: </span>{user.email}
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: '#888' }}>권한: </span>
        {user.role === 'ADMIN' ? '관리자' : '일반 회원'}
      </div>
      <div style={{ marginTop: 24, fontSize: '0.95em', color: '#666' }}>
        언제든 궁금한 점이 있으면 1:1 문의를 남겨주세요.
      </div>
    </div>
  );
};

export default MyPage; 