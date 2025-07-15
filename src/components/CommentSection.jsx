import React, { useState, useEffect } from 'react';
import './CommentSection.css';

const CommentSection = ({ auctionId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [auctionId]);

  const loadComments = () => {
    // 임시 댓글 데이터
    const mockComments = [
      {
        id: 1,
        userId: "user123",
        username: "경매왕",
        content: "정말 좋은 물건이네요! 입찰해보고 싶습니다.",
        timestamp: "2024-01-10T15:30:00",
        likes: 3,
        replies: [
          {
            id: 11,
            userId: "seller1",
            username: "애플전문점",
            content: "감사합니다! 좋은 가격에 낙찰되시길 바랍니다.",
            timestamp: "2024-01-10T16:00:00"
          }
        ]
      },
      {
        id: 2,
        userId: "user456",
        username: "스마트쇼퍼",
        content: "배터리 상태는 어떤가요? 사용 기간이 궁금합니다.",
        timestamp: "2024-01-10T14:45:00",
        likes: 1,
        replies: []
      },
      {
        id: 3,
        userId: "user789",
        username: "디지털러버",
        content: "M2 Pro 성능이 정말 대단하죠. 게임도 잘 돌아갈까요?",
        timestamp: "2024-01-10T14:20:00",
        likes: 2,
        replies: []
      },
      {
        id: 4,
        userId: "user101",
        username: "테크마스터",
        content: "보증 기간이 1년이라니 안심이네요. 애플 공식 보증이니까요.",
        timestamp: "2024-01-10T13:55:00",
        likes: 4,
        replies: []
      }
    ];

    setComments(mockComments);
    setLoading(false);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      userId: "currentUser",
      username: "나",
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
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
        <span className="comment-count">{comments.length}개</span>
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
        {comments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <p>아직 댓글이 없습니다.</p>
            <span>첫 번째 댓글을 작성해보세요!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <span className="username">{comment.username}</span>
                  <span className="timestamp">{formatTime(comment.timestamp)}</span>
                </div>
                <div className="comment-actions">
                  <button 
                    className="btn-like"
                    onClick={() => handleLike(comment.id)}
                  >
                    👍 {comment.likes}
                  </button>
                  <button 
                    className="btn-reply"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    답글
                  </button>
                </div>
              </div>
              
              <div className="comment-content">
                {comment.content}
              </div>

              {/* 답글 작성 폼 */}
              {replyTo === comment.id && (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="답글을 작성해주세요..."
                    rows="2"
                    className="reply-input"
                  />
                  <div className="reply-actions">
                    <button 
                      className="btn-submit-reply"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      답글 작성
                    </button>
                    <button 
                      className="btn-cancel-reply"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 답글 목록 */}
              {comment.replies.length > 0 && (
                <div className="reply-list">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <span className="username">{reply.username}</span>
                        <span className="timestamp">{formatTime(reply.timestamp)}</span>
                      </div>
                      <div className="reply-content">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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