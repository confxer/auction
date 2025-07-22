import React from 'react';
import '../style/MainBanner.css';

const MainBanner = () => (
  <div className="main-banner">
    <img src="/public/images/sopum.jpg" alt="광고 배너" />
    <div className="banner-text">
      <h2>🎉 지금 경매 이벤트 진행중!</h2>
      <p>최대 50% 할인 경매, 신규회원 특별 혜택!</p>
      <a href="/event" className="banner-btn">이벤트 바로가기</a>
    </div>
  </div>
);

export default MainBanner; 