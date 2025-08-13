import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';

const defaultAuthContext = {
  isLoggedIn: false,
  user: null,
  handleLoginSuccess: () => {},
  logout: () => {}, // logout으로 이름 변경
};

export const AuthContext = createContext(defaultAuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 앱 시작 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("사용자 정보 파싱 오류:", error);
      localStorage.removeItem('user');
    }
  }, []);

  // [복원] AuthPage에서 호출할 로그인 성공 핸들러
  const handleLoginSuccess = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  }, [navigate]);

  // [수정] 로그아웃 함수 (API 연동)
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      console.log('서버 로그아웃 성공');
    } catch (error) {
      console.error('서버 로그아웃 실패 (클라이언트 처리는 계속 진행):', error);
    } finally {
      // API 호출 성공 여부와 관계없이 클라이언트 측 로그아웃 처리를 실행
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const value = {
    isLoggedIn: !!user,
    user,
    handleLoginSuccess,
    logout, // Navbar에서 사용할 함수
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}