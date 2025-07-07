import React from "react";

function HeaderTitle() {
    return (
        <div style={{
            width: "100%",
            textAlign: "center",
            marginTop: 32,
            marginBottom: 24
        }}>
      <span
          style={{
              fontFamily: "'Dancing Script', 'Pacifico', cursive",
              fontSize: 48,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#111",
              letterSpacing: 2
          }}
      >
        cherish Auction
      </span>
        </div>
    );
}

export default HeaderTitle;