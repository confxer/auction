import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem"
      }}>
        로딩 중...
      </div>
    );
  }

  if (!user) {
    // 로그인 페이지로 리다이렉트하면서 현재 위치 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // 관리자 권한이 필요한 페이지에 일반 사용자가 접근한 경우
    return <Navigate to="/" replace />;
  }

  return children;
} 