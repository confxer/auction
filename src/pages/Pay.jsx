import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../axiosConfig"; // 기존 axios 인스턴스 사용

export default function CheckoutPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaypalReady, setIsPaypalReady] = useState(false);

  useEffect(() => {
    const fetchAuctionData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/auctions/${id}`);
        console.log(response.data);
        setAuction(response.data);
        setPrice(response.data.currentPrice);
      } catch (error) {
        console.error("데이터 Fetch 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctionData();
  }, [id]);

  useEffect(() => {
    if (!price || !auction) return;

    if (window.paypal) {
      window.paypal.Buttons({
          createOrder: async (data, actions) => {
            try {
              const response = await axios.post("/api/payments/create-order", { amount: price });
              return response.data;
            } catch (error) {
              console.error("PayPal 주문 생성 실패:", error);
              alert("결제를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
              return null;
            }
          },
          // 2. 결제 승인: 사용자가 PayPal에서 결제를 승인하면 호출
          onApprove: async (data, actions) => {
            try {
              // 서버에 주문 캡처(최종 승인) 요청
              const response = await axios.post("/api/payments/capture-order", { orderId: data.orderID });
              console.log("결제 성공:", response.data);

              // 결제 성공 후 로직 (예: 성공 페이지로 이동)
              alert("결제가 성공적으로 완료되었습니다.");
              window.location.href = `${window.location.origin}/success`; // 성공 페이지로 리디렉션
            } catch (error) {
              console.error("PayPal 결제 승인 실패:", error);
              alert("결제 승인 중 문제가 발생했습니다.");
              window.location.href = `${window.location.origin}/fail`; // 실패 페이지로 리디렉션
            }
          },
          // 3. 에러 처리
          onError: (err) => {
            console.error("PayPal 버튼 에러:", err);
            alert("결제 중 에러가 발생했습니다.");
          },
        })
        .render("#paypal-button-container")
        .then(() => {
          setIsPaypalReady(true); // 버튼 렌더링 완료
        });
    }
  }, [auction, price]); // 경매 정보나 가격이 변경되면 버튼을 다시 렌더링

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!auction) {
    return <div>경매 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="wrapper w-100">
      {/* ... 기존 UI ... */}
      <h1>{auction.title}</h1>
      <p>결제할 금액: {price.toLocaleString()}원</p>

      {/* PayPal 버튼이 렌더링될 컨테이너 */}
      <div id="paypal-button-container" style={{ display: isPaypalReady ? 'block' : 'none' }} />

      {/* 로딩 상태 표시 */}
      {!isPaypalReady && <div>결제 버튼 로딩 중...</div>}
    </div>
  );
}