import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import '../style/Pay.css';

// 🔽 클라이언트 키는 본인 것으로 교체하세요.
const clientKey = "test_ck_6bJXmgo28e1G4DDAwL7Y8LAnGKWx";

export function CheckoutPage() {
  const { id } = useParams();
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [price, setPrice] = useState(50000);
  const [auction, setAuction] = useState();

  useEffect(() => {
    
    const customerKey = nanoid(); // 고객의 고유 ID
    
    const initializePaymentWidget = async () => {
      const res = await fetch(`/api/auctions/${id}`);
        if (!res.ok) throw new Error('서버 응답 오류');
        const data = await res.json();
        setAuction(data);
       if(data.id) setPrice(data.currentPrice);
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
  }, [id]);

  const handlePaymentRequest = async () => {
    try {
      await paymentWidgetRef.current?.requestPayment({
        orderId: nanoid(),
        orderName: auction.title,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
    } catch (error) {
      console.error("결제 요청 에러:", error);
    }
  };

  return (
    <div className="wrapper w-100">
      <div className="max-w-540 w-100">
        <div className="flex-column align-center">
          <h1 className="title">주문서</h1>
        </div>
        <div className="response-section w-100">
          <div className="flex justify-between">
            <span className="response-label">결제할 금액</span>
            <span id="price" className="response-text">{`${price.toLocaleString()}원`}</span>
          </div>
        </div>

        {/* 결제 UI */}
        <div className="w-100" id="payment-method" />
        {/* 약관 UI */}
        <div className="w-100" id="agreement" />

        {/* 결제하기 버튼 */}
        <div className="btn-wrapper w-100">
          <button className="btn primary w-100" onClick={handlePaymentRequest}>
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}