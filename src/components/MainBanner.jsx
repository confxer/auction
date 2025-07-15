import React from "react";
import "./MainBanner.css";

const banners = [
  { img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800", text: "에이티즈 앨범 한정판" },
  { img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", text: "시그니처 도로시" },
  { img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800", text: "단 3일 주말 장보기" },
];

const MainBanner = () => (
  <div className="main-banner">
    {banners.map((b, i) => (
      <div className="banner-slide" key={i}>
        <img src={b.img} alt={b.text} />
        <div className="banner-text">{b.text}</div>
      </div>
    ))}
  </div>
);

export default MainBanner; 