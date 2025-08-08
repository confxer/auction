import { useEffect, useRef, useState } from "react";
import {
  loadPaymentWidget,
  ANONYMOUS,
} from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid"; // 고유한 주문번호 생성을 위한 라이브러리 (선택)
import { useParams } from "react-router-dom";
import './style/Pay.css';

const clientKey = "test_ck_6bJXmgo28e1G4DDAwL7Y8LAnGKWx"; // 발급받은 클라이언트 키로 교체하세요.

export default function CheckoutPage() {
  const { id } = useParams();
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [price, setPrice] = useState(50000); // 결제 금액
  const [auction, setAuction] = useState();

  useEffect(() => {
    (async () => {
        const res = await fetch(`/api/auctions/${id}`);
        if (!res.ok) throw new Error('서버 응답 오류');
        const data = await res.json();
        setAuction(data);
       if(data.id) setPrice(data.currentPrice);
      // ------  결제위젯 초기화 ------
      // 비회원 결제일 경우 customerKey를 ANONYMOUS로 설정
      const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS); // 회원 결제일 경우 ANONYMOUS 대신 회원 ID를 넣어주세요.

      // ------  결제 UI 렌더링 ------
      // 결제수단 UI를 렌더링할 위치를 지정합니다. `#payment-method`와 같은 CSS 선택자로 지정할 수 있습니다.
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-method",
        { value: price },
        { variantKey: "DEFAULT" } // 결제 수단 UI 옵션
      );

      // ------  이용약관 UI 렌더링 ------
      // 이용약관 UI를 렌더링할 위치를 지정합니다. `#agreement`와 같은 CSS 선택자로 지정할 수 있습니다.
      paymentWidget.renderAgreement("#agreement", {
        variantKey: "AGREEMENT", // 약관 UI 옵션
      });

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;

      
    })();
  }, [id]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;
    console.log(window.location.origin);

    try {
      // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
      await paymentWidget?.requestPayment({
        orderId: nanoid(), // 고유한 주문 ID
        orderName: auction.title,
        successUrl: `${window.location.origin}/success`, // 성공 리다이렉트 URL
        failUrl: `${window.location.origin}/fail`,     // 실패 리다이렉트 URL
        customerEmail: "customer123@gmail.com",
        customerName: auction.winner,
      });
    } catch (error) {
      // 에러 처리
      console.error(error);
    }
  };

  return (
    <div>
      <h1>주문서</h1>
      <span>{`${price.toLocaleString()}원`}</span>
      <div id="payment-method" /> {/* 결제 수단 UI가 렌더링될 위치 */}
      <div id="agreement" />      {/* 이용 약관 UI가 렌더링될 위치 */}
      <button onClick={handlePaymentRequest}>결제하기</button>
    </div>
  );
}