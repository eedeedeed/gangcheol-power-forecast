import React, { createContext, useState, useCallback } from 'react';

const defaultAuthContext = {
  isLoggedIn: false,
  user: null, // ⭐️ user 상태의 기본값을 null로 추가
  handleLoginSuccess: () => {},
  handleLogout: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export default function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // ⭐️ 로그인한 사용자 정보를 저장할 state

  // ⭐️ 로그인 성공 시 사용자 정보(userData)를 인자로 받아 저장합니다.
  const handleLoginSuccess = useCallback((userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  }, []);

  // ⭐️ 로그아웃 시 사용자 정보도 깨끗하게 비웁니다.
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const value = {
    isLoggedIn,
    user, // ⭐️ Provider를 통해 user 정보를 내려줍니다.
    handleLoginSuccess,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}