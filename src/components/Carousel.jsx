function Carousel() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                margin: "32px 0",
                padding: 0,
                minHeight: 320,
                gap: 32
            }}
        >
            {/* 왼쪽 이미지 */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                    src="/images/scooter.jpg"
                    alt="스쿠터"
                    style={{
                        width: 240,
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: "#eee"
                    }}
                />
            </div>
            {/* 가운데 이미지 */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                    src="/images/p3.jpg"
                    alt="고양이 오브제"
                    style={{
                        width: 240,
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: "#eee"
                    }}
                />
            </div>
            {/* 오른쪽 이미지 추가 */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                    src="/images/sopum.jpg"
                    alt="소품"
                    style={{
                        width: 240,
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: "#eee"
                    }}
                />
            </div>
        </div>
    );
}
export default Carousel;