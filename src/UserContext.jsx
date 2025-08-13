import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from './axiosConfig';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './utils/cookieUtils';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setUser({ ...response.data, accessToken: token });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          const success = await refreshToken();
          if (success) {
            const newToken = getAccessToken();
            try {
              const response = await axios.get('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/me', {
                headers: { 'Authorization': `Bearer ${newToken}` },
              });
              setUser({ ...response.data, accessToken: newToken });
            } catch (retryErr) {
              console.error('Retry after refresh failed:', retryErr);
              logout();
            }
          } else {
            logout();
          }
        } else {
          console.error('Authentication check failed:', err);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/register', userData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.accessToken) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        setUser({ ...response.data.user, accessToken: response.data.accessToken });
        return { success: true, data: response.data };
      } else {
        throw new Error('토큰이 응답에 없습니다.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    const token = getAccessToken();
    if (token) {
      axios.post('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(err => console.error('Logout API call failed:', err));
    }
    clearTokens();
    setUser(null);
    setError(null);
  };

  const refreshToken = async () => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) return false;

    try {
      const response = await axios.post('http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com/api/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      if (response.data.accessToken) {
        setTokens(response.data.accessToken, refreshTokenValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return false;
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
 