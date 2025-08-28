import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';

// Context Providers import
import ThemeProvider from './contexts/ThemeContext';
import AuthProvider from './contexts/AuthContext';
import BuildingProvider from './contexts/BuildingContext';
import NotificationProvider from './contexts/NotificationContext';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 모든 Provider가 App을 감싸도록 위치 변경 */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <BuildingProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </BuildingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);