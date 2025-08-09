// src/hooks/AppContext.jsx
import React, { createContext, useContext } from 'react';
import useAppContext from './useAppcontext'; // 수정된 부분

// 컨텍스트 생성
export const AppContext = createContext();

// AppProvider 컴포넌트
export function AppProvider({ children }) {
  const appContextValue = useAppContext();

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
}

// 컨텍스트를 쉽게 사용하기 위한 커스텀 훅
export const useApp = () => {
  return useContext(AppContext);
};
