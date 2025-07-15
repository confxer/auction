import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../axiosConfig";
import "../components/ProductCarousel.css";

const SearchResult = () => {
  const [results, setResults] = useState([]);
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query");

  useEffect(() => {
    if (query) {
      axios.get(`/api/auctions?query=${encodeURIComponent(query)}`)
        .then(res => setResults(res.data))
        .catch(() => setResults([]));
    }
  }, [query]);

  return (
    <div className="search-result-container" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 18 }}>검색 결과: "{query}"</h2>
      <div className="carousel-list">
        {results.length === 0 && <div>검색 결과가 없습니다.</div>}
        {results.map((p, i) => (
          <div className="product-card" key={i}>
            <img src={p.imageUrl1} alt={p.title} />
            <div className="product-title">{p.title}</div>
            <div className="product-price">{p.highestBid ? p.highestBid.toLocaleString() : 0}원</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResult; 