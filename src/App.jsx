import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import axios from "./axiosConfig";
import FavoriteAlertProvider from "./components/FavoriteAlertProvider";

// 컴포넌트들
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import QuickMenu from "./components/QuickMenu";
import PrivateMessage from './components/PrivateMessage';

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
import NoticeList from "./pages/NoticeList";
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

function App() {
  const [dashboardData, setDashboardData] = useState({
    auctions: [],
    notices: [],
    faqs: [],
    events: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🚀 대시보드 데이터 로드 시작");
        const response = await axios.get("/api/dashboard");
        console.log("✅ 대시보드 데이터 응답 성공:", response.data);
        console.log("📊 받은 데이터 구조:", {
          auctions: response.data.auctions?.length || 0,
          notices: response.data.notices?.length || 0,
          faqs: response.data.faqs?.length || 0,
          events: response.data.events?.length || 0
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("❌ 대시보드 데이터 로드 실패:", error);
        // 샘플 데이터 생성 시도
        try {
          console.log("🔄 샘플 데이터 생성 시도");
          await axios.post("/api/sample-data");
          console.log("✅ 샘플 데이터 생성 완료");
          
          // 다시 데이터 로드 시도
          const retryResponse = await axios.get("/api/dashboard");
          console.log("🔄 재시도 후 데이터:", retryResponse.data);
          setDashboardData(retryResponse.data);
        } catch (sampleError) {
          console.error("❌ 샘플 데이터 생성 실패:", sampleError);
        }
      } finally {
        console.log("🏁 데이터 로딩 완료, loading 상태를 false로 설정");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <UserProvider>
      <FavoriteAlertProvider>
        <Router>
          <div className="App">
            <Navigation />
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
                <Route path="/messages" element={<PrivateMessage />} />
              </Routes>
            </main>
            <QuickMenu />
            <Footer />
          </div>
        </Router>
      </FavoriteAlertProvider>
    </UserProvider>
  );
}

export default App;