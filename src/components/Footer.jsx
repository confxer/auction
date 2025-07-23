import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* 회사 정보 */}
          <div className="footer-section">
            <h3 className="footer-title">몬스터옥션</h3>
            <p className="footer-description">
              안전하고 신뢰할 수 있는 경매 플랫폼
            </p>
            <div className="footer-contact">
              <p>📞 고객센터: 1588-0000</p>
              <p>📧 이메일: orange@gmail.com</p>
              <p>🕒 운영시간: 평일 09:00 - 18:00</p>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="footer-section">
            <h4 className="footer-subtitle">빠른 링크</h4>
            <ul className="footer-links">
              <li><Link to="/auction">경매 보기</Link></li>
              <li><Link to="/auction/new">물품 등록</Link></li>
              <li><Link to="/notice">공지사항</Link></li>
              <li><Link to="/faq">자주묻는질문</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div className="footer-section">
            <h4 className="footer-subtitle">고객지원</h4>
            <ul className="footer-links">
              <li><Link to="/inquiry">1:1문의</Link></li>
              <li><Link to="/customer-service">고객센터</Link></li>
              <li><Link to="/terms">이용약관</Link></li>
              <li><Link to="/privacy">개인정보처리방침</Link></li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div className="footer-section">
            <h4 className="footer-subtitle">회사 정보</h4>
            <div className="company-info">
              <p>상호명: (주)몬스터옥션</p>
              <p>대표: 오렌지</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>주소: 서울특별시 종로구 돈화문로 26</p>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2025 몬스터옥션. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="badge">안전거래</span>
              <span className="badge">신뢰도 1위</span>
              <span className="badge">고객만족도 우수</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 