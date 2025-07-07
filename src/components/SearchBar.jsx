function SearchBar() {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",     // 가운데 정렬
            alignItems: "center",
            width: "100%",
            margin: "32px 0"
        }}>
            <input
                type="text"
                placeholder="검색어를 입력해주세요"
                style={{
                    width: 480,                // (길이만 늘림, 예시로 480px, 원하는 만큼 조절)
                    height: 40,                // 기존 높이 유지
                    padding: "0 20px",
                    fontSize: 16,
                    border: "1px solid #ccc",
                    borderRadius: "20px 0 0 20px",
                    outline: "none"
                }}
            />
            <button
                style={{
                    height: 40,                // 인풋과 높이 맞춤
                    width: 48,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderLeft: "none",
                    borderRadius: "0 20px 20px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {/* 검정색 돋보기 아이콘 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#232323" strokeWidth="2" fill="none"/>
                    <line x1="18" y1="18" x2="23" y2="23" stroke="#232323" strokeWidth="2"/>
                </svg>
            </button>
        </div>
    );
}

export default SearchBar;