import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "axios";

const OAuth2Success = () => {
  const [params] = useSearchParams();
  const { user, login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          // UserContext의 login 함수를 사용하여 사용자 정보 설정
          navigate("/");
        });
    }
  }, [params, navigate]);

  return <div>로그인 중...</div>;
};

export default OAuth2Success; 