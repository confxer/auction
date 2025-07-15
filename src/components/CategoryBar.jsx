import React from "react";
import "./CategoryBar.css";

const categories = [
  { icon: "🚚", name: "즉시구매" },
  { icon: "🏠", name: "주택/부동산" },
  { icon: "👗", name: "패션" },
  { icon: "🍎", name: "식품" },
  { icon: "🎮", name: "게임" },
  { icon: "💄", name: "뷰티" },
  { icon: "🎫", name: "티켓" },
  { icon: "🚗", name: "자동차" },
];

const CategoryBar = () => (
  <div className="category-bar">
    {categories.map((c, i) => (
      <div className="category-icon" key={i}>
        <span>{c.icon}</span>
        <span>{c.name}</span>
      </div>
    ))}
  </div>
);

export default CategoryBar; 