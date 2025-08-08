import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const requestData = {
        paymentKey: searchParams.get("paymentKey"),
        orderId: searchParams.get("orderId"),
        amount: searchParams.get("amount"),
      };

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const responseData = await response.json();
          setIsConfirmed(true);
          setPaymentInfo(responseData); // Spring Boot에서 받은 결제 정보를 상태에 저장
        } else {
          // TODO: 결제 실패 비즈니스 로직 구현
          const errorData = await response.json();
          window.location.href = `/fail?code=${errorData.code}&message=${errorData.message}`;
        }
      } catch (error) {
        console.error("승인 요청 에러:", error);
      }
    };

    confirmPayment();
  }, []);

  return (
    <div className="wrapper w-100">
      {isConfirmed ? (
        // --- 결제 성공 시 ---
        <div className="flex-column align-center confirm-success w-100 max-w-540" style={{ display: 'flex' }}>
          <img src="https://static.toss.im/illusts/check-blue-spot-motion.gif" width="120" height="120" alt="성공 아이콘"/>
          <h1 className="title">결제를 완료했어요</h1>
          
          <div className="response-section w-100">
            <div className="flex justify-between">
              <span className="response-label">결제 금액</span>
              <span className="response-text">
                {Number(paymentInfo?.totalAmount).toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문번호</span>
              <span className="response-text">{paymentInfo?.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">paymentKey</span>
              <span className="response-text">{paymentInfo?.paymentKey}</span>
            </div>
          </div>

          <div className="w-100 button-group">
            <a className="btn primary w-100" href="https://docs.tosspayments.com/guides/payment-widget/integration">
              연동 문서로 돌아가기
            </a>
            <a className="btn w-100" href="https://github.com/tosspayments/payment-widget-examples" target="_blank" rel="noopener noreferrer">
              다른 예제 보러가기
            </a>
          </div>
        </div>
      ) : (
        // --- 결제 승인 대기 중 ---
        <div className="flex-column align-center justify-center confirm-loading w-100 h-100">
          <div className="flex-column align-center">
            <img src="https://static.toss.im/lotties/loading-spot-apng.png" width="120" height="120" alt="로딩 아이콘"/>
            <h1 className="title">결제 승인 중</h1>
            <p className="description">잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}