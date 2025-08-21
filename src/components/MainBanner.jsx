import React from 'react';
import '../style/MainBanner.css';

const MainBanner = () => (
  <div className="main-banner">
    <img src="/images/sopum.jpg" alt="광고 배너" />
    <div className="banner-text">
      <h2>🎉 홍보배너 지원 많관부!</h2>
      <p>“낙찰은 타이밍” — 주저하면 늦는다! ⌛️</p>
      <a href="/event" className="banner-btn">이벤트 바로가기</a>
    </div>
  </div>
);

export default MainBanner; 