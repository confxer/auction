import axios from 'axios';
import { getAccessToken, getRefreshToken, clearTokens } from './utils/cookieUtils';

// axios 기본 설정
axios.defaults.baseURL = "";
axios.defaults.withCredentials = true; // 쿠키 자동 전송

// 요청 인터셉터 - 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post('http://localhost:8080/api/auth/refresh', {
            refreshToken: refreshToken
          });

          if (response.data.accessToken) {
            // 새로운 토큰 저장
            const { setTokens } = await import('./utils/cookieUtils');
            setTokens(response.data.accessToken, refreshToken);
            
            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios; 