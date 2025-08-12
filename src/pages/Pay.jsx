import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import axios from "../axiosConfig";
import '../style/Pay.css';

const clientKey = "test_ck_6bJXmgo28e1G4DDAwL7Y8LAnGKWx";

export default function CheckoutPage() {
  const { id } = useParams();
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);
  
  const [auction, setAuction] = useState(null);
  const [price, setPrice] = useState(0); // 초기 금액은 0으로 설정하여 데이터 로딩 상태를 명확히 함
  const [isLoading, setIsLoading] = useState(true);

  // customerKey는 컴포넌트가 살아있는 동안 한 번만 생성되어야 한다.
  const customerKey = useMemo(() => nanoid(), []);

  // 1. 경매 데이터 Fetch useEffect
  useEffect(() => {
    const fetchAuctionData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/auctions/${id}`);
        if (!res.ok) throw new Error('서버에서 경매 정보를 가져오는 데 실패했습니다.');
        const data = await res.json();
        setAuction(data);
        setPrice(data.currentPrice);
      } catch (error) {
        console.error("데이터 Fetch 에러:", error);
        // 사용자에게 에러 상황을 알리는 UI 처리 필요
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionData();
  }, [id]);

  // 2. 데이터 Fetch 완료 후, 결제 위젯 초기화 useEffect
  useEffect(() => {
    // 경매 정보가 없거나, 가격이 0 이하면 위젯을 렌더링하지 않는다.
    if (!auction || price <= 0) return;

    const initializePaymentWidget = async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      
      paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-method",
        { value: price },
        { variantKey: "DEFAULT" }
      );

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    };
    
    initializePaymentWidget();
  }, [auction, price, customerKey]); // auction과 price가 확정된 후 실행

  // handlePaymentRequest: 보안이 적용된 결제 요청 핸들러
  const handlePaymentRequest = async () => {
    if (!paymentWidgetRef.current || !auction) {
      console.error("결제 위젯 또는 주문 정보가 준비되지 않았습니다.");
      return;
    }
    
    const paymentWidget = paymentWidgetRef.current;
    const orderId = nanoid();

    try {
      // --- [필수] 서버에 결제 정보 생성 및 검증 요청 ---
      // 이 과정이 없으면 금액 위변조에 그대로 노출된다.
      const validationResponse = await axios.post("/api/payments/validate", {
        orderId: orderId,
        amount: price,
    });

      if (!validationResponse.ok) {
        throw new Error("결제 정보 검증에 실패했습니다.");
      }

      // --- 검증 성공 후, 결제창 호출 ---
      await paymentWidget.requestPayment({
        orderId: orderId,
        orderName: auction.title,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
        customerName: "고객 이름", // 실제 사용자 정보로 대체 필요
      });
    } catch (error) {
      console.error("결제 요청 에러:", error);
      alert(error);
    }
  };

  // 로딩 중 UI
  if (isLoading) {
    return <div>로딩 중...</div>;
  }
  
  // 데이터가 없을 경우 UI
  if (!auction) {
    return <div>경매 정보를 찾을 수 없습니다.</div>
  }

  return (
    <div className="wrapper w-100">
      <div className="max-w-540 w-100">
        <div className="flex-column align-center">
          <h1 className="title">주문서</h1>
          <h2 className="title">{auction.title}</h2>
        </div>
        <div className="response-section w-100">
          <div className="flex justify-between">
            <span className="response-label">결제할 금액</span>
            <span id="price" className="response-text">{`${price.toLocaleString()}원`}</span>
          </div>
        </div>

        <div className="w-100" id="payment-method" />
        <div className="w-100" id="agreement" />

        <div className="btn-wrapper w-100">
          <button className="btn primary w-100" onClick={handlePaymentRequest} disabled={!paymentMethodsWidgetRef.current}>
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}