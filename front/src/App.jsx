// src/App.jsx
import React, { useEffect, useState, useCallback } from 'react'; 
import { powerData } from './data';

// 분리된 스타일 파일들을 임포트합니다.
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/monitoring.css';
import './styles/alerts.css';
import './styles/guide.css';
import './styles/auth.css';

// 각 탭에 해당하는 컴포넌트들을 임포트합니다.
import Dashboard from './components/Dashboard';
import BuildingMonitoring from './components/BuildingMonitoring';
import Alerts from './components/Alerts';
import Guide from './components/Guide';
import Settings from './components/Settings';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';

function App() {
  // 현재 활성화된 탭을 관리하는 상태입니다. 최초 접속 시 'auth' 탭을 띄웁니다.
  const [activeTab, setActiveTab] = useState('auth');
  // 사용자 로그인 상태를 관리하는 상태입니다. 초기값은 false입니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 현재 전력 사용량을 관리하는 상태입니다.
  const [currentUsage, setCurrentUsage] = useState(powerData.current_power.usage);
  // 현재 전력 사용량의 용량 대비 퍼센트를 관리하는 상태입니다.
  const [usagePercentage, setUsagePercentage] = useState(powerData.current_power.percentage);
  // 현재 선택된 건물의 ID를 관리하는 상태입니다. 기본값은 본관(ID: 1)입니다.
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  // 빠른 알림 목록을 관리하는 상태입니다. powerData.alerts로 초기화됩니다.
  const [quickAlerts, setQuickAlerts] = useState(powerData.alerts);
  // 절감 가이드 목록을 관리하는 상태입니다. powerData.savings_guide로 초기화됩니다.
  const [savingsGuides, setSavingsGuides] = useState(powerData.savings_guide);
  
  // 드롭다운 메뉴 상태 추가
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // 실시간 전력 사용량 업데이트를 시뮬레이션하는 useEffect 훅입니다.
  useEffect(() => {
    // 로그인 상태가 아닐 때는 데이터 업데이트를 하지 않습니다.
    if (!isLoggedIn) {
      return;
    }
    const interval = setInterval(() => {
      // 선택된 건물 데이터를 powerData에서 찾습니다.
      const selectedBuilding = powerData.buildings.find(b => b.id === selectedBuildingId);
      if (!selectedBuilding) return;
      // 현재 사용량에 작은 변동을 주어 실시간 변화를 시뮬레이션합니다.
      const fluctuation = (Math.random() - 0.5) * 20;
      const newUsage = Math.max(selectedBuilding.current + fluctuation, 0);
      // 새로운 사용량과 퍼센트를 상태에 업데이트합니다.
      setCurrentUsage(Math.round(newUsage));
      const newPercentage = ((newUsage / powerData.current_power.capacity) * 100);
      setUsagePercentage(newPercentage);
    }, 3000);
    // 컴포넌트 언마운트 시 인터벌을 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(interval);
  }, [selectedBuildingId, isLoggedIn]);

  // 탭 클릭을 처리하는 콜백 함수입니다.
  const handleTabClick = useCallback((tabId) => {
    // 로그인되지 않은 상태에서 'auth' 탭이 아닌 다른 탭을 클릭하면 'auth' 탭으로 강제 이동
    if (!isLoggedIn && tabId !== 'auth') {
      setActiveTab('auth');
      return;
    }
    setActiveTab(tabId);
    setIsUserDropdownOpen(false); // 탭 클릭 시 드롭다운 닫기
  }, [isLoggedIn]);

  // 건물 선택 드롭다운 변경을 처리하는 콜백 함수입니다.
  const handleBuildingSelect = useCallback((e) => {
    const newBuildingId = parseInt(e.target.value);
    setSelectedBuildingId(newBuildingId);
    // 건물 선택 시, 해당 건물의 현재 사용량과 퍼센트를 업데이트하여 대시보드에 반영합니다.
    const newSelectedBuilding = powerData.buildings.find(b => b.id === newBuildingId);
    if (newSelectedBuilding) {
      setCurrentUsage(newSelectedBuilding.current);
      setUsagePercentage((newSelectedBuilding.current / powerData.current_power.capacity) * 100);
    }
  }, []);

  // 알림 카드를 닫는 함수입니다.
  const handleDismissAlert = useCallback((alertId) => {
    setQuickAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  }, []);

  // 절감 가이드 카드를 닫는 함수입니다.
  const handleDismissGuide = useCallback((guideIndex) => {
    setSavingsGuides(prevGuides => prevGuides.filter((_, index) => index !== guideIndex));
  }, []);

  // 로그인 성공 시 호출될 함수입니다.
  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    console.log('로그인 성공: 대시보드로 이동합니다.');
  }, []);

  // 로그아웃 시 호출될 함수입니다.
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setActiveTab('auth');
    setIsUserDropdownOpen(false); // 로그아웃 시 드롭다운 닫기
    console.log('로그아웃 되었습니다. 로그인 페이지로 돌아갑니다.');
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserDropdownOpen(false);
    };

    if (isUserDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // 현재 선택된 건물 데이터를 powerData에서 찾아옵니다.
  const currentBuildingData = powerData.buildings.find(b => b.id === selectedBuildingId);

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
              <div className="navbar-menu">
                <button 
                  onClick={() => handleTabClick('dashboard')} 
                  className={`navbar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  대시보드
                </button>
                <button 
                  onClick={() => handleTabClick('alerts')} 
                  className={`navbar-item ${activeTab === 'alerts' ? 'active' : ''}`}
                >
                  알림
                </button>
                <button 
                  onClick={() => handleTabClick('guide')} 
                  className={`navbar-item ${activeTab === 'guide' ? 'active' : ''}`}
                >
                  절감 가이드
                </button>
                
                {/* 회원정보 드롭다운 메뉴 - 설정 추가 */}
                <div 
                  className="navbar-dropdown"
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className={`navbar-item navbar-item--dropdown ${
                      activeTab === 'profile' || activeTab === 'monitoring' || activeTab === 'settings' ? 'active' : ''
                    }`}
                  >
                    회원정보
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="navbar-dropdown-menu">
                      <button 
                        onClick={() => handleTabClick('monitoring')}
                        className={`dropdown-item ${activeTab === 'monitoring' ? 'active' : ''}`}
                      >
                        건물관리
                      </button>
                      <button 
                        onClick={() => handleTabClick('profile')}
                        className={`dropdown-item ${activeTab === 'profile' ? 'active' : ''}`}
                      >
                        회원정보
                      </button>
                      <button 
                        onClick={() => handleTabClick('profile-edit')}
                        className={`dropdown-item ${activeTab === 'profile-edit' ? 'active' : ''}`}
                      >
                        프로필 수정
                      </button>
                      <button 
                        onClick={() => handleTabClick('settings')}
                        className={`dropdown-item ${activeTab === 'settings' ? 'active' : ''}`}
                      >
                        설정
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item dropdown-item--danger"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* 메인 콘텐츠 영역 */}
          <div className="main-container">
            {/* 좌측 사이드바 - 조건부 렌더링 */}
            {!['monitoring', 'profile', 'profile-edit', 'settings'].includes(activeTab) && (
              <aside className="sidebar">
                {/* 건물 선택 섹션 */}
                <section className="sidebar-section">
                  <h4>건물 선택</h4>
                  <select 
                    value={selectedBuildingId} 
                    onChange={handleBuildingSelect}
                    className="form-control"
                  >
                    {powerData.buildings.map(building => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </section>

                {/* 빠른 알림 섹션 */}
                <section className="sidebar-section">
                  <h4>빠른 알림</h4>
                  <div className="quick-alerts">
                    {quickAlerts.map(alert => (
                      <div key={alert.id} className={`quick-alert quick-alert--${alert.type}`}>
                        {alert.message}
                        <button 
                          onClick={() => handleDismissAlert(alert.id)}
                          className="quick-alert-close-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 절감 가이드 요약 섹션 */}
                <section className="sidebar-section">
                  <h4>절감 가이드</h4>
                  <div className="savings-summary">
                    {savingsGuides.map((guide, index) => (
                      <div key={index} className="savings-item">
                        <span className="savings-value">{guide.expected_saving}</span> - {guide.action}
                        <button 
                          onClick={() => handleDismissGuide(index)}
                          className="quick-alert-close-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            )}

            {/* 메인 콘텐츠 - 사이드바 유무에 따른 스타일 조정 */}
            <main className={`main-content ${
              ['monitoring', 'profile', 'profile-edit', 'settings'].includes(activeTab) 
                ? 'main-content--full-width' 
                : ''
            }`}>
              {activeTab === 'dashboard' && (
                <Dashboard
                  currentPower={{
                    usage: currentUsage,
                    percentage: usagePercentage,
                    capacity: powerData.current_power.capacity
                  }}
                  todayUsage={powerData.today_usage}
                  tomorrowPrediction={powerData.tomorrow_prediction}
                  stats={powerData.stats}
                  selectedBuildingData={currentBuildingData}
                />
              )}
              {activeTab === 'monitoring' && <BuildingMonitoring />}
              {activeTab === 'alerts' && <Alerts alerts={quickAlerts} />}
              {activeTab === 'guide' && <Guide guides={savingsGuides} />}
              {activeTab === 'settings' && <Settings />}
              {(activeTab === 'profile' || activeTab === 'profile-edit') && (
                <ProfilePage onLogout={handleLogout} />
              )}
            </main>
          </div>
        </>
      ) : (
        /* 로그인하지 않은 상태에서는 인증 페이지만 표시 */
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
