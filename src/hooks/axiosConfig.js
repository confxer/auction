// src/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true // 쿠키 기반 인증 사용하는 경우에만 true, JWT만 사용하면 생략 가능
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // 로그인 시 저장된 JWT
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // 토큰이 있으면 헤더에 추가
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default instance;
