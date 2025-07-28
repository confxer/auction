import React, { useState, useEffect } from 'react';
import './CommentSection.css';
import axios from '../axiosConfig';
import { useUser } from '../UserContext';

const CommentSection = ({ auctionId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [auctionId]);

  // 서버에서 댓글 목록 불러오기
  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/comments/auction/${auctionId}`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
    setLoading(false);
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post('/api/comments', {
        auctionId,
        content: newComment,
        // userId, author는 백엔드에서 자동 세팅
      });
      setNewComment('');
      loadComments(); // 댓글 목록 새로고침
    } catch (err) {
      alert('댓글 등록 실패');
    }
  };

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      userId: "currentUser",
      username: "나",
      content: replyText,
      timestamp: new Date().toISOString()
    };

    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyText('');
    setReplyTo(null);
  };

  const handleLike = (commentId) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 댓글 목록이 배열이 아닐 때 안전하게 처리
  const safeComments = Array.isArray(comments) ? comments : [];

  if (loading) {
    return (
      <div className="comment-section-loading">
        <div className="loading-spinner"></div>
        <p>댓글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h2>댓글</h2>
        <span className="comment-count">{safeComments.length}개</span>
      </div>

      {/* 댓글 작성 폼 */}
      <div className="comment-form">
        <form onSubmit={handleSubmitComment}>
          <div className="form-group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              rows="3"
              className="comment-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={!newComment.trim()}>
              댓글 작성
            </button>
          </div>
        </form>
      </div>

      {/* 댓글 목록 */}
      <div className="comment-list">
        {safeComments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <p>아직 댓글이 없습니다.</p>
            <span>첫 번째 댓글을 작성해보세요!</span>
          </div>
        ) : (
          safeComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <span className="username">{comment.author}</span>
                  <span className="timestamp">{formatTime(comment.createdAt)}</span>
                </div>
                {/* 삭제 버튼: admin은 모두, user는 본인만 */}
                {user && (user.role === 'ADMIN' || user.id === comment.userId) && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{ marginLeft: 8, background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="comment-content">
                {comment.content}
              </div>
              {/* 답글/답글 목록은 서버 연동 후 구현 (현재는 주석 처리) */}
              {/*
              {replyTo === comment.id && (
                <div className="reply-form"> ... </div>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <div className="reply-list"> ... </div>
              )}
              */}
            </div>
          ))
        )}
      </div>

      {/* 댓글 안내 */}
      <div className="comment-notice">
        <h3>댓글 안내</h3>
        <ul>
          <li>상품과 관련된 질문이나 의견을 남겨주세요.</li>
          <li>욕설, 비방, 광고성 댓글은 삭제될 수 있습니다.</li>
          <li>판매자와 구매자 간의 소통 공간입니다.</li>
          <li>개인정보는 댓글에 포함하지 마세요.</li>
        </ul>
      </div>
    </div>
  );
};

export default CommentSection; 