import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../style/MyPage.css';

const MyPage = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserInfo();
  }, [user, navigate]);

  const loadUserInfo = async () => {
    try {
      console.log('🔍 사용자 정보 로드 시작');
      const response = await axios.get('/api/users/me');
      console.log('✅ 사용자 정보 로드 성공:', response.data);
      setUserInfo(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ 사용자 정보 로드 실패:', error);
      console.error('📊 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mypage-loading">
        <div className="loading-spinner"></div>
        <p>정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="mypage-error">
        <p>사용자 정보를 불러올 수 없습니다.</p>
        <button onClick={() => navigate('/login')}>로그인 페이지로</button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: '👤 프로필', component: <ProfileTab userInfo={userInfo} onUpdate={loadUserInfo} /> },
    { id: 'password', label: '🔒 비밀번호 변경', component: <PasswordTab /> },
    { id: 'nickname', label: '📝 닉네임 변경', component: <NicknameTab userInfo={userInfo} onUpdate={loadUserInfo} /> },
    { id: 'email', label: '📧 이메일 인증', component: <EmailTab userInfo={userInfo} onUpdate={loadUserInfo} /> },
    { id: 'auctions', label: '📦 내 경매글', component: <MyAuctionsTab /> },
    { id: 'comments', label: '💬 내 댓글', component: <MyCommentsTab /> },
    { id: 'delete', label: '❌ 회원 탈퇴', component: <DeleteAccountTab onDelete={() => navigate('/')} /> }
  ];

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h1>마이페이지</h1>
        <div className="user-welcome">
          <strong>{userInfo.nickname || userInfo.username}</strong>님, 환영합니다!
        </div>
      </div>

      <div className="mypage-content">
        <div className="mypage-sidebar">
          <div className="user-info-card">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <h3>{userInfo.nickname || userInfo.username}</h3>
              <p>{userInfo.email}</p>
              <p className="user-role">
                {userInfo.role === 'ADMIN' ? '관리자' : '일반 회원'}
              </p>
            </div>
          </div>

          <nav className="mypage-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mypage-main">
          <div className="tab-content">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

// 프로필 탭 컴포넌트
const ProfileTab = ({ userInfo, onUpdate }) => {
  const [formData, setFormData] = useState({
    nickname: userInfo.nickname || '',
    address: userInfo.address || '',
    phone: userInfo.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // 닉네임을 제외한 값만 전송
    const { address, phone } = formData;
    try {
      await axios.put('/api/users/me', { address, phone });
      alert('회원정보가 수정되었습니다.');
      onUpdate();
    } catch (error) {
      alert('회원정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab">
      <h2>회원정보 수정</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>닉네임</label>
          <input
            type="text"
            value={formData.nickname}
            readOnly
            style={{ background: "#f5f5f5", color: "#888" }}
            placeholder="닉네임은 닉네임 변경 탭에서만 수정 가능합니다"
          />
          <small style={{ color: "#888" }}>
            닉네임은 '닉네임 변경' 탭에서만 수정할 수 있습니다.
          </small>
        </div>
        
        <div className="form-group">
          <label>주소</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="주소를 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label>연락처</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="연락처를 입력하세요"
          />
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? '수정 중...' : '회원정보 수정'}
        </button>
      </form>
    </div>
  );
};

// 비밀번호 변경 탭 컴포넌트
const PasswordTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      alert('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put('/api/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      alert('비밀번호가 변경되었습니다.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-tab">
      <h2>비밀번호 변경</h2>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
        </div>
        
        <div className="form-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            placeholder="새 비밀번호를 입력하세요"
            required
          />
        </div>
        
        <div className="form-group">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="새 비밀번호를 다시 입력하세요"
            required
          />
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
};

// 닉네임 변경 탭 컴포넌트
const NicknameTab = ({ userInfo, onUpdate }) => {
  const [newNickname, setNewNickname] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkNickname = async () => {
    if (!newNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    
    setChecking(true);
    try {
      const response = await axios.get(`/api/users/check-nickname?nickname=${newNickname}`);
      setAvailable(response.data.available);
      alert(response.data.message);
    } catch (error) {
      alert('닉네임 확인에 실패했습니다.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    
    if (available === false) {
      alert('사용할 수 없는 닉네임입니다.');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put('/api/users/me/nickname', { nickname: newNickname });
      alert('닉네임이 변경되었습니다.');
      setNewNickname('');
      setAvailable(null);
      onUpdate();
    } catch (error) {
      alert('닉네임 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nickname-tab">
      <h2>닉네임 변경</h2>
      <div className="current-nickname">
        <p>현재 닉네임: <strong>{userInfo.nickname || userInfo.username}</strong></p>
      </div>
      
      <form onSubmit={handleSubmit} className="nickname-form">
        <div className="form-group">
          <label>새 닉네임</label>
          <div className="nickname-input-group">
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="새 닉네임을 입력하세요"
              required
            />
            <button 
              type="button" 
              onClick={checkNickname} 
              disabled={checking || !newNickname.trim()}
              className="check-btn"
            >
              {checking ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          {available !== null && (
            <span className={`availability ${available ? 'available' : 'unavailable'}`}>
              {available ? '✓ 사용 가능' : '✗ 사용 불가'}
            </span>
          )}
        </div>
        
        <button type="submit" disabled={loading || available === false} className="submit-btn">
          {loading ? '변경 중...' : '닉네임 변경'}
        </button>
      </form>
    </div>
  );
};

// 이메일 인증 탭 컴포넌트
const EmailTab = ({ userInfo, onUpdate }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const sendVerificationEmail = async () => {
    setSending(true);
    try {
      await axios.post('/api/users/verify-email');
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (error) {
      alert('인증 코드 발송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const verifyEmail = async () => {
    if (!verificationCode.trim()) {
      alert('인증 코드를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-email', { token: verificationCode });
      alert('이메일 인증이 완료되었습니다.');
      setVerificationCode('');
      onUpdate();
    } catch (error) {
      alert('이메일 인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-tab">
      <h2>이메일 인증</h2>
      <div className="email-status">
        <p>이메일: <strong>{userInfo.email}</strong></p>
        <p>인증 상태: 
          <span className={`status ${userInfo.emailVerified ? 'verified' : 'unverified'}`}>
            {userInfo.emailVerified ? '인증 완료' : '미인증'}
          </span>
        </p>
      </div>
      
      {!userInfo.emailVerified && (
        <div className="verification-form">
          <button 
            onClick={sendVerificationEmail} 
            disabled={sending}
            className="send-btn"
          >
            {sending ? '발송 중...' : '인증 코드 발송'}
          </button>
          
          <div className="form-group">
            <label>인증 코드</label>
            <div className="verification-input-group">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="인증 코드를 입력하세요"
              />
              <button 
                onClick={verifyEmail} 
                disabled={loading || !verificationCode.trim()}
                className="verify-btn"
              >
                {loading ? '인증 중...' : '인증하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 내 경매글 탭 컴포넌트
const MyAuctionsTab = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAuctions();
  }, []);

  const loadMyAuctions = async () => {
    try {
      const response = await axios.get('/api/users/me/auctions');
      setAuctions(response.data);
    } catch (error) {
      console.error('내 경매글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">경매글을 불러오는 중...</div>;
  }

  return (
    <div className="auctions-tab">
      <h2>내가 쓴 경매글</h2>
      {auctions.length === 0 ? (
        <div className="empty-state">
          <p>등록한 경매글이 없습니다.</p>
        </div>
      ) : (
        <div className="auctions-list">
          {auctions.map(auction => (
            <div key={auction.id} className="auction-item">
              <h3>
                <Link to={`/auction/${auction.id}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  {auction.title}
                </Link>
              </h3>
              <p>시작가: {auction.startPrice?.toLocaleString()}원</p>
              <p>현재가: {auction.highestBid?.toLocaleString()}원</p>
              <p>상태: {auction.isClosed ? '종료' : '진행중'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 내 댓글 탭 컴포넌트
const MyCommentsTab = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyComments();
  }, []);

  const loadMyComments = async () => {
    try {
      const response = await axios.get('/api/users/me/comments');
      setComments(response.data);
    } catch (error) {
      console.error('내 댓글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">댓글을 불러오는 중...</div>;
  }

  return (
    <div className="comments-tab">
      <h2>내가 쓴 댓글</h2>
      {comments.length === 0 ? (
        <div className="empty-state">
          <p>작성한 댓글이 없습니다.</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <p className="comment-content">{comment.content}</p>
              <p className="comment-meta">
                경매: <Link to={`/auction/${comment.auctionId}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>{comment.auctionId}</Link> | 작성일: {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 회원 탈퇴 탭 컴포넌트
const DeleteAccountTab = ({ onDelete }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!confirm('정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.delete('/api/users/me', { data: { password } });
      alert('회원 탈퇴가 완료되었습니다.');
      onDelete();
    } catch (error) {
      alert('회원 탈퇴에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-tab">
      <h2>회원 탈퇴</h2>
      <div className="warning-message">
        <p>⚠️ 회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
      </div>
      
      <form onSubmit={handleDelete} className="delete-form">
        <div className="form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        <button type="submit" disabled={loading} className="delete-btn">
          {loading ? '탈퇴 중...' : '회원 탈퇴'}
        </button>
      </form>
    </div>
  );
};

export default MyPage; 