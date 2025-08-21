import React, { useEffect, useState } from "react";
import "../style/Inquiry.css";
import axios from "../axiosConfig";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Inquiry = () => {
  const { user } = useUser();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if(!user){
      navigate('/login');
      return; 
    }

    if (user) {
      setLoading(true);
      loadInquiries();
    } 
  }, [user]);

  const loadInquiries = async () => {
    try {
      const response = await axios.get("/api/inquiry/my");
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInquiries(sorted);
    } catch (error) {
      console.error("❌ 문의 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dt) =>
    dt ? new Date(dt).toLocaleString("ko-KR") : "-";

  const getStatusLabel = (status) => {
    const map = { 대기: "🕓 대기", 처리중: "🔄 처리중", 완료: "✅ 완료" };
    return map[status] || status;
  };

  const getCategoryLabel = (category) => {
    const map = {
      auction: "경매",
      payment: "결제",
      delivery: "배송",
      refund: "환불/교환",
      account: "회원정보",
      technical: "기술지원",
    };
    return map[category] || category;
  };

  const paginated = inquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);

  const handleViewDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="inquiry-user-loading">
        <div className="loading-spinner"></div>
        <p>📨 나의 문의내역 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="inquiry-user-page">
      <div className="inquiry-user-header">
        <h2>📨 나의 문의내역</h2>
        <a href="/inquiry-new" className="write-btn">✏️ 문의하기</a>
      </div>

      <div className="table-scroll-x">
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>닉네임</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>첨부파일</th>
              <th>상태</th>
              <th>작성일</th>
              <th>답변</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={item.id} onClick={() => handleViewDetail(item)}>
                <td>{item.id}</td>
                <td>{item.userName || "-"}</td>
                <td>{item.title}</td>
                <td>{getCategoryLabel(item.category)}</td>
                <td>
                  {item.attachmentUrl ? (
                    <a href={item.attachmentUrl} target="_blank" rel="noreferrer">🔗</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{getStatusLabel(item.status)}</td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>{item.answer ? "✅ 있음" : "❌ 없음"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? "active" : ""}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>다음</button>
        </div>
      )}

      {showDetailModal && selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => {
            setSelectedInquiry(null);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
};

const InquiryDetailModal = ({ inquiry, onClose }) => {
  const formatDateTime = (dt) =>
    dt ? new Date(dt).toLocaleString("ko-KR") : "-";

  const getCategoryLabel = (category) => {
    const map = {
      auction: "경매",
      payment: "결제",
      delivery: "배송",
      refund: "환불/교환",
      account: "회원정보",
      technical: "기술지원",
    };
    return map[category] || category;
  };

  return (
    <div className="modal-overlay">
      <div className="user-detail-modal">
        <div className="modal-header">
          <h3>문의 상세 보기</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <p><strong>제목:</strong> {inquiry.title}</p>
          <p><strong>작성자:</strong> {inquiry.userName || "-"}</p>
          <p><strong>카테고리:</strong> {getCategoryLabel(inquiry.category)}</p>
          <p><strong>작성일:</strong> {formatDateTime(inquiry.createdAt)}</p>
          <p><strong>내용:</strong></p>
          <div className="inquiry-content">{inquiry.content}</div>
          {inquiry.attachmentUrl && (
            <p><strong>첨부파일:</strong> <a href={inquiry.attachmentUrl} target="_blank" rel="noreferrer">🔗 보기</a></p>
          )}
          {inquiry.answer && (
            <div className="reply-box">
              <h5>📬 관리자 답변</h5>
              <p>{inquiry.answer}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
