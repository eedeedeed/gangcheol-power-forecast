// src/App.jsx
import React, { useContext, useState } from 'react';
import { AppContext, AppProvider } from './hooks/AppContext';

// 스타일 파일 임포트
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/monitoring.css';
import './styles/alerts.css';
import './styles/guide.css';
import './styles/auth.css';

// 컴포넌트 임포트
import Sidebar from './components/layout/Sidebar';
//import AuthPage from './components/auth/AuthPage'; // 경로 수정
import AuthPage2 from './components/auth/AuthPage'; //👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍
import Dashboard from './components/Dashboard';
import BuildingMonitoring from './components/BuildingMonitoring';
import Alerts from './components/Alerts';
import Guide from './components/Guide';
import Settings from './components/Settings';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/layout/Navbar'; // Navbar 컴포넌트 임포트

// 현재 활성화된 탭에 따라 메인 콘텐츠를 렌더링하는 컴포넌트
function MainContent() {
  const {
    activeTab,
    powerData,
    currentUsage,
    usagePercentage,
    currentBuildingData,
    quickAlerts,
    savingsGuides,
    handleLogout,
    setDisplayInterval, // setDisplayInterval 함수를 컨텍스트에서 가져옵니다.
  } = useContext(AppContext);

  // activeTab에 따라 다른 컴포넌트를 렌더링
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            currentPower={{
              usage: currentUsage,
              percentage: usagePercentage,
              capacity: powerData.current_power.capacity,
            }}
            todayUsage={powerData.today_usage}
            tomorrowPrediction={powerData.tomorrow_prediction}
            stats={powerData.stats}
            selectedBuildingData={currentBuildingData}
            onIntervalChange={setDisplayInterval} // Dashboard에 prop으로 전달합니다.
          />
        );
      case 'monitoring':
        return <BuildingMonitoring />;
      case 'alerts':
        return <Alerts alerts={quickAlerts} />;
      case 'guide':
        return <Guide guides={savingsGuides} />;
      case 'settings':
        return <Settings />;
      case 'profile':
      case 'profile-edit':
        return <ProfilePage onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  const isFullWidth = ['monitoring', 'profile', 'profile-edit', 'settings'].includes(activeTab);

  return (
    <div className="main-container">
      {!isFullWidth && <Sidebar />}
      <main className={`main-content ${isFullWidth ? 'main-content--full-width' : ''}`}>
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { isLoggedIn, handleLoginSuccess, activeTab, handleLogout, setActiveTab } = useContext(AppContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    // 애플리케이션의 최상위 컨테이너입니다.
    <div className="app-container">
      {isLoggedIn ? (
        <>
          {/* 상단 네비게이션 바 */}
          <nav className="navbar">
            <div className="navbar-container">
              {/* 클릭 가능한 제목 */}
              <div 
                className="navbar-brand"
                onClick={() => handleTabClick('dashboard')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabClick('dashboard');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="대시보드로 이동"
              >
                <h2>Power Monitoring</h2>
              </div>
              <Navbar />
            </div>
          </nav>
          <MainContent />
        </>
      ) : (
        <AuthPage2 onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;