import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import axios from "../axiosConfig";

const clientKey = "test_ck_6bJXmgo28e1G4DDAwL7Y8LAnGKWx";

export default function CheckoutPage() {
  const { id } = useParams();
  const paymentWidgetRef = useRef(null);

  const [auction, setAuction] = useState(null);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false); // <<-- [수정 1] ref 대신 state 사용

  const customerKey = useMemo(() => nanoid(), []);

  // [수정 2] 일관성을 위해 fetch 대신 axios 인스턴스 사용
  useEffect(() => {
    const fetchAuctionData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/auctions/${id}`);
        const data = response.data; // axios는 data 프로퍼티에 응답 본문이 담겨있다.
        setAuction(data);
        setPrice(data.currentPrice);
      } catch (error) {
        console.error("데이터 Fetch 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctionData();
  }, [id]);

  useEffect(() => {
    if (!auction || price <= 0) return;

    const initializePaymentWidget = async () => {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidget.renderPaymentMethods("#payment-method", { value: price }, { variantKey: "DEFAULT" });
        paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
        paymentWidgetRef.current = paymentWidget;
        setIsWidgetReady(true); // <<-- [수정 1] 모든 렌더링 후 상태를 true로 변경
      } catch (error) {
        console.error("결제 위젯 초기화 실패:", error);
      }
    };
    
    initializePaymentWidget();
  }, [auction, price, customerKey]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget || !auction) {
      console.error("결제 위젯 또는 주문 정보가 준비되지 않았습니다.");
      return;
    }
    
    const orderId = nanoid();

    try {
      // [수정 3] axios의 응답 처리를 올바르게 수정
      await axios.post("/payments/validate", {
        orderId: orderId,
        amount: price,
      });

      // 위 요청이 성공하면 (에러가 발생하지 않으면), 다음 로직으로 넘어간다.
      await paymentWidget.requestPayment({
        orderId: orderId,
        orderName: auction.title,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
        customerName: "고객 이름",
      });
    } catch (error) {
      // [수정 4] 에러 처리를 구체적으로 수정
      console.error("결제 요청 에러:", error);
      if (error.response) {
        alert(error.response.data.message || "결제 검증에 실패했습니다.");
      } else {
        alert("결제 요청 중 문제가 발생했습니다.");
      }
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }
  
  if (!auction) {
    return <div>경매 정보를 찾을 수 없습니다.</div>
  }

  return (
    <div className="wrapper w-100">
      {/* ... UI ... */}
      <div className="w-100" id="payment-method" />
      <div className="w-100" id="agreement" />
      <div className="btn-wrapper w-100">
        {/* [수정 1] ref가 아닌 state에 따라 버튼을 제어 */}
        <button className="btn primary w-100" onClick={handlePaymentRequest} disabled={!isWidgetReady}>
          {isWidgetReady ? `${price.toLocaleString()}원 결제하기` : '결제 모듈 로딩 중...'}
        </button>
      </div>
    </div>
  );
}