import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from './assets/logo.png'; 

// Contexts
import { ThemeContext } from './contexts/ThemeContext';
import { AuthContext } from './contexts/AuthContext';
import { NotificationContext } from './contexts/NotificationContext';
import { BuildingContext } from './contexts/BuildingContext';

// Styles
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/monitoring.css';
import './styles/auth.css';

// Components
import Navbar from './components/layout/Navbar';
import NotificationManager from './components/common/NotificationManager';
import NotificationDetailsModal from './components/dashboard/NotificationDetailsModal';

// Page Components
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import BuildingMonitoring from './pages/BuildingMonitoring';
import Settings from './pages/Settings';
import ProfilePage from './pages/ProfilePage';

// ✅ [수정] 팝업 관련 props 모두 제거
function MainLayout({ isEditMode, handleEditModeToggle }) {
  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <img src={logo} alt="FLEAK 로고" className="navbar-logo" />
          </Link>
          <Navbar 
            isEditMode={isEditMode}
            onEditModeToggle={handleEditModeToggle}
          />
        </div>
      </nav>
      <div className="main-container">
        <main className="main-content">
          {/* ✅ [수정] Outlet context에 handleEditModeToggle 추가 */}
          <Outlet context={{ isEditMode, handleEditModeToggle }} />
        </main>
      </div>
    </div>
  );
}

// ✅ [수정] 팝업 관련 props 모두 제거
function ProtectedRoute({ isEditMode, handleEditModeToggle }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? (
    <MainLayout 
      isEditMode={isEditMode}
      handleEditModeToggle={handleEditModeToggle}
    />
  ) : <Navigate to="/auth" replace />;
}

function App() {
  const { theme } = useContext(ThemeContext);
  const { isModalOpen, selectedNotification, closeNotificationModal } = useContext(NotificationContext);
  
  const { selectedBuilding } = useContext(BuildingContext);
  const { addRealtimeAlert } = useContext(NotificationContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const handleEditModeToggle = useCallback(() => setIsEditMode(prev => !prev), []);
  
  // ✅ [제거] 대시보드 편집 확인 팝업 관련 상태 및 핸들러 모두 제거

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("현재 위치:", `위도(lat): ${position.coords.latitude},`, `경도(lng): ${position.coords.longitude}`);
      },
      () => {
        console.warn("위치 정보를 가져오는 데 실패했습니다.");
      }
    );
  }, []);

  return (
    <>
      <NotificationManager />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        {/* ✅ [수정] ProtectedRoute에 전달하는 props 단순화 */}
        <Route element={
          <ProtectedRoute 
            isEditMode={isEditMode}
            handleEditModeToggle={handleEditModeToggle}
          />
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<BuildingMonitoring />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <ToastContainer theme={theme} limit={1} />
      <NotificationDetailsModal 
        isOpen={isModalOpen}
        onClose={closeNotificationModal}
        notification={selectedNotification}
      />
    </>
  );
}

export default App;