import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import axios from "../axiosConfig";
import ProtectedRoute from "../components/ProtectedRoute";
import "../style/AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, historyRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/users"),
        axios.get("/api/admin/login-history")
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoginHistory(historyRes.data);
    } catch (error) {
      console.error("대시보드 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      loadDashboardData(); // 데이터 새로고침
    } catch (error) {
      console.error("사용자 역할 업데이트 실패:", error);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { isActive });
      loadDashboardData(); // 데이터 새로고침
    } catch (error) {
      console.error("사용자 상태 업데이트 실패:", error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="admin-loading">로딩 중...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>관리자 대시보드</h1>
          <p>환영합니다, {user?.username}님!</p>
        </div>

        {/* 시스템 통계 */}
        {stats && (
          <div className="stats-section">
            <h2>시스템 통계</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>총 사용자</h3>
                <p>{stats.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>활성 사용자</h3>
                <p>{stats.activeUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>오늘 로그인</h3>
                <p>{stats.todayLogins || 0}</p>
              </div>
              <div className="stat-card">
                <h3>총 경매</h3>
                <p>{stats.totalAuctions || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* 사용자 관리 */}
        <div className="users-section">
          <h2>사용자 관리</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>사용자명</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>가입일</th>
                  <th>마지막 로그인</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={user.isActive ? "true" : "false"}
                        onChange={(e) => updateUserStatus(user.id, e.target.value === "true")}
                      >
                        <option value="true">활성</option>
                        <option value="false">비활성</option>
                      </select>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "로그인 기록 없음"
                      }
                    </td>
                    <td>
                      <button 
                        onClick={() => updateUserStatus(user.id, !user.isActive)}
                        className={user.isActive ? "btn-deactivate" : "btn-activate"}
                      >
                        {user.isActive ? "비활성화" : "활성화"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 로그인 이력 */}
        <div className="login-history-section">
          <h2>최근 로그인 이력</h2>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>사용자</th>
                  <th>IP 주소</th>
                  <th>상태</th>
                  <th>로그인 시간</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.slice(0, 10).map((history) => (
                  <tr key={history.id} className={history.status === "FAILED" ? "failed-login" : ""}>
                    <td>{history.user?.username || "알 수 없음"}</td>
                    <td>{history.loginIp || "알 수 없음"}</td>
                    <td>
                      <span className={`status-badge ${history.status.toLowerCase()}`}>
                        {history.status === "SUCCESS" ? "성공" : "실패"}
                      </span>
                    </td>
                    <td>{new Date(history.loginAt).toLocaleString()}</td>
                    <td className="user-agent">{history.userAgent || "알 수 없음"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 