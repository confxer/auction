import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        if (response.ok) {
          // 결제 성공, 최종 결과 페이지로 이동 또는 상태 업데이트
          console.log("Payment success:", await response.json());
          navigate("/completion");
        } else {
          // 승인 실패, 실패 페이지로 리디렉션
          const error = await response.json();
          navigate(`/fail?message=${error.message}&code=${error.code}`);
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
        navigate(`/fail?message=${error.message}`);
      }
    };

    confirmPayment();
  }, [navigate, searchParams]);

  return (
    <div>
      <h2>결제 승인 중...</h2>
    </div>
  );
}