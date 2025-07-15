import React from "react";
import "./ProductCarousel.css";

const ProductCarousel = ({ title, products }) => (
  <section className="product-carousel">
    <h2>{title}</h2>
    <div className="carousel-list">
      {products.map((p, i) => (
        <div className="product-card" key={i}>
          <img src={p.imageUrl1} alt={p.title} />
          <div className="product-title">{p.title}</div>
          <div className="product-price">{p.highestBid ? p.highestBid.toLocaleString() : 0}원</div>
        </div>
      ))}
    </div>
  </section>
);

export default ProductCarousel; 