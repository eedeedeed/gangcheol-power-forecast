import React, { createContext, useState, useCallback } from 'react';

const defaultAuthContext = {
  isLoggedIn: false,
  handleLoginSuccess: () => {},
  handleLogout: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export default function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const value = {
    isLoggedIn,
    handleLoginSuccess,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}