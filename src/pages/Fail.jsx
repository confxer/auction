import { useSearchParams } from "react-router-dom";

export default function FailPage() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const code = searchParams.get("code");

  return (
    <div>
      <h1>결제 실패</h1>
      <p><b>에러 코드:</b> {code}</p>
      <p><b>에러 메시지:</b> {message}</p>
    </div>
  );
}