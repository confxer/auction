// 쿠키 관련 유틸리티 함수들

// 쿠키에서 특정 이름의 값을 가져오기
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// 쿠키에 값 설정하기
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
};

// 쿠키 삭제하기
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// 토큰 관련 쿠키 함수들
export const getAccessToken = () => {
  return getCookie('accessToken') || localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return getCookie('refreshToken') || localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken, refreshToken) => {
  setCookie('accessToken', accessToken);
  setCookie('refreshToken', refreshToken);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}; 