import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserProvider, useUser } from "./UserContext";
import axios from "./axiosConfig";
import FavoriteAlertProvider from "./components/FavoriteAlertProvider";
import useNotificationSocket from "./hooks/useNotificationSocket"; // WebSocket 알림 훅
import { NotificationProvider, useNotifications } from "./hooks/NotificationContext"; // ✅ 알림 훅 가져오기
// 컴포넌트들
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import QuickMenu from "./components/QuickMenu";

// 페이지들
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auction from "./pages/Auction";
import AuctionDetail from "./pages/AuctionDetail";
import AuctionNew from "./pages/AuctionNew";
import CustomerService from "./pages/CustomerService";
import FAQ from "./pages/FAQ";
import FAQList from "./pages/FAQList";
import FAQAdmin from "./pages/FAQAdmin";
import Inquiry from "./pages/Inquiry";
import InquiryList from "./pages/InquiryList";
import InquiryMy from "./pages/InquiryMy";
import InquiryNew from "./pages/InquiryNew";
import InquiryDetail from "./pages/InquiryDetail";
import InquiryAdmin from "./pages/InquiryAdmin";
import InquiryAdminDetailPage from "./pages/InquiryAdminDetailPage";
import Notice from "./pages/Notice";
import NoticeList from "./components/NoticeList";
import NoticeDetail from "./pages/NoticeDetail";
import NoticeAdmin from "./pages/NoticeAdmin";
import Event from "./pages/Event";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import EventAdmin from "./pages/EventAdmin";
import OAuth2Success from "./pages/OAuth2Success";
import SearchResult from "./pages/SearchResult";
import MyPage from "./pages/MyPage";
import Favorites from "./pages/Favorites";
import KakaoMap from "./pages/KakaoMap";

// 🔁 내부 컴포넌트로 감싸서 useUser 사용 가능하게 처리
function AppContent() {
  const [dashboardData, setDashboardData] = useState({
    auctions: [],
    notices: [],
    faqs: [],
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications(); // ✅ 알림 추가 함수 가져오기
  
  const { user } = useUser();
  useNotificationSocket(user?.id, addNotification); // ✅ 콜백 등록

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        try {
          await axios.post("/api/sample-data");
          const retryResponse = await axios.get("/api/dashboard");
          setDashboardData(retryResponse.data);
        } catch (sampleError) {
          console.error("Error creating sample data:", sampleError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <ToastContainer /> {/* ✅ 알림 토스트 표시 */}
        <main>
          <Routes>
            <Route path="/" element={<Home dashboardData={dashboardData} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/auction-new" element={<AuctionNew />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/faq-list" element={<FAQList />} />
            <Route path="/faq/admin" element={<FAQAdmin />} />
            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/inquiry-list" element={<InquiryList />} />
            <Route path="/inquiry-my" element={<InquiryMy />} />
            <Route path="/inquiry-new" element={<InquiryNew />} />
            <Route path="/inquiry/:id" element={<InquiryDetail />} />
            <Route path="/inquiry/admin" element={<InquiryAdmin />} />
            <Route path="/inquiry/admin/:id" element={<InquiryAdminDetailPage />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice-list" element={<NoticeList />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/notice/admin" element={<NoticeAdmin />} />
            <Route path="/event" element={<Event />} />
            <Route path="/event-list" element={<EventList />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/admin" element={<EventAdmin />} />
            <Route path="/oauth2/success" element={<OAuth2Success />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/map" element={<KakaoMap />} />
            <Route path="/auction/:id/pay" element={<Pay />} />
          </Routes>
        </main>
        <QuickMenu />
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <FavoriteAlertProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
      </FavoriteAlertProvider>
    </UserProvider>
  );
}


export default App;
