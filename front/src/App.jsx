// src/App.jsx
// 이 파일은 전체 애플리케이션의 메인 레이아웃과 내비게이션을 담당하는 최상위 컴포넌트입니다.
// 다양한 탭(대시보드, 모니터링 등)을 관리하고, 데이터 시뮬레이션을 통해 하위 컴포넌트에 데이터를 전달합니다.

import React, { useEffect, useState, useCallback } from 'react';
import { powerData } from './data'; // 애플리케이션의 샘플 데이터를 임포트합니다.

// 분리된 스타일 파일들을 임포트합니다.
// 각 CSS 파일은 특정 섹션 또는 컴포넌트의 스타일을 담당합니다.
import './styles/base.css';       // 기본/전역 스타일 및 디자인 시스템 변수
import './styles/components.css';  // 재사용 가능한 UI 컴포넌트 스타일
import './styles/layout.css';      // 전체 레이아웃 (내비게이션, 사이드바, 메인 콘텐츠) 스타일
import './styles/dashboard.css';   // 대시보드 특정 스타일
import './styles/monitoring.css';  // 건물 모니터링 특정 스타일
import './styles/alerts.css';      // 알림 관련 스타일
import './styles/guide.css';       // 절감 가이드 특정 스타일
import './styles/auth.css';        // 인증(로그인/회원가입) 페이지 스타일

// 각 탭에 해당하는 컴포넌트들을 임포트합니다.
import Dashboard from './components/Dashboard';
import BuildingMonitoring from './components/BuildingMonitoring';
import Alerts from './components/Alerts';
import Guide from './components/Guide';
import Settings from './components/Settings';
import AuthPage from './components/AuthPage'; // 인증 페이지 컴포넌트
import ProfilePage from './components/ProfilePage'; // 프로필 페이지 컴포넌트

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

  // 실시간 전력 사용량 업데이트를 시뮬레이션하는 useEffect 훅입니다.
  // 3초마다 선택된 건물의 현재 사용량을 기반으로 값을 업데이트합니다.
  useEffect(() => {
    // 로그인 상태가 아닐 때는 데이터 업데이트를 하지 않습니다.
    if (!isLoggedIn) {
      return;
    }

    const interval = setInterval(() => {
      // 선택된 건물 데이터를 powerData에서 찾습니다.
      const selectedBuilding = powerData.buildings.find(b => b.id === selectedBuildingId);
      if (!selectedBuilding) return; // 선택된 건물이 없으면 업데이트하지 않습니다.

      // 현재 사용량에 작은 변동을 주어 실시간 변화를 시뮬레이션합니다.
      const fluctuation = (Math.random() - 0.5) * 20; // -10 ~ +10 사이의 랜덤 값
      const newUsage = Math.max(selectedBuilding.current + fluctuation, 0); // 사용량이 0 미만으로 내려가지 않도록 합니다.

      // 새로운 사용량과 퍼센트를 상태에 업데이트합니다.
      setCurrentUsage(Math.round(newUsage));
      const newPercentage = ((newUsage / powerData.current_power.capacity) * 100);
      setUsagePercentage(newPercentage);

    }, 3000); // 3초마다 업데이트

    // 컴포넌트 언마운트 시 인터벌을 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(interval);
  }, [selectedBuildingId, isLoggedIn]); // selectedBuildingId와 isLoggedIn이 변경될 때마다 이 효과를 재실행합니다.

  // 탭 클릭을 처리하는 콜백 함수입니다.
  // useCallback을 사용하여 함수가 불필요하게 재생성되는 것을 방지합니다.
  const handleTabClick = useCallback((tabId) => {
    // 로그인되지 않은 상태에서 'auth' 탭이 아닌 다른 탭을 클릭하면 'auth' 탭으로 강제 이동
    if (!isLoggedIn && tabId !== 'auth') {
      setActiveTab('auth');
      return;
    }
    setActiveTab(tabId); // 클릭된 탭의 ID로 activeTab 상태를 업데이트합니다.
  }, [isLoggedIn]);

  // 건물 선택 드롭다운 변경을 처리하는 콜백 함수입니다.
  // useCallback을 사용하여 함수가 불필요하게 재생성되는 것을 방지합니다.
  const handleBuildingSelect = useCallback((e) => {
    const newBuildingId = parseInt(e.target.value); // 선택된 건물 ID를 정수로 변환합니다.
    setSelectedBuildingId(newBuildingId); // 선택된 건물 ID를 상태에 저장합니다.

    // 건물 선택 시, 해당 건물의 현재 사용량과 퍼센트를 업데이트하여 대시보드에 반영합니다.
    const newSelectedBuilding = powerData.buildings.find(b => b.id === newBuildingId);
    if (newSelectedBuilding) {
        setCurrentUsage(newSelectedBuilding.current);
        setUsagePercentage((newSelectedBuilding.current / powerData.current_power.capacity) * 100);
    }
  }, []);

  // 알림 카드를 닫는 함수입니다.
  // 알림 ID를 받아 해당 알림을 quickAlerts 상태에서 제거합니다.
  const handleDismissAlert = useCallback((alertId) => {
    setQuickAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  }, []);

  // 절감 가이드 카드를 닫는 함수입니다.
  // 가이드의 인덱스를 받아 해당 가이드를 savingsGuides 상태에서 제거합니다.
  const handleDismissGuide = useCallback((guideIndex) => {
    setSavingsGuides(prevGuides => prevGuides.filter((_, index) => index !== guideIndex));
  }, []);

  // 로그인 성공 시 호출될 함수입니다.
  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true); // 로그인 상태를 true로 변경
    setActiveTab('dashboard'); // 대시보드 탭으로 이동
    console.log('로그인 성공: 대시보드로 이동합니다.');
  }, []);

  // 로그아웃 시 호출될 함수입니다.
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false); // 로그인 상태를 false로 변경
    setActiveTab('auth'); // 인증 페이지로 이동
    console.log('로그아웃 되었습니다. 로그인 페이지로 돌아갑니다.');
  }, []);

  // 현재 선택된 건물 데이터를 powerData에서 찾아옵니다.
  const currentBuildingData = powerData.buildings.find(b => b.id === selectedBuildingId);

  return (
    // 애플리케이션의 최상위 컨테이너입니다.
    <div className="app">
      {/* 상단 내비게이션 바 컴포넌트입니다. */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* 애플리케이션 브랜드 로고 및 이름입니다. */}
          <div className="navbar-brand">
            <h2> 제목 제목 </h2>
          </div>
          {/* 내비게이션 메뉴 항목들입니다. */}
          <div className="navbar-menu">
            {/* 로그인 상태일 때만 대시보드, 모니터링, 알림 관리, 절감 가이드, 설정 탭을 표시합니다. */}
            {isLoggedIn && (
              <>
                <a href="#" className={`navbar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')} data-tab="dashboard">대시보드</a>
                <a href="#" className={`navbar-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => handleTabClick('monitoring')} data-tab="monitoring">건물 관리</a>
                <a href="#" className={`navbar-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => handleTabClick('alerts')} data-tab="alerts">알림 관리</a>
                <a href="#" className={`navbar-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => handleTabClick('guide')} data-tab="guide">절감 가이드</a>
                <a href="#" className={`navbar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')} data-tab="settings">설정</a>
              </>
            )}
            {/* 로그인 상태에 따라 로그인/회원가입 또는 회원정보 버튼을 조건부 렌더링합니다. */}
            {!isLoggedIn ? (
              <a href="#" className={`navbar-item ${activeTab === 'auth' ? 'active' : ''}`} onClick={() => handleTabClick('auth')} data-tab="auth">로그인/회원가입</a>
            ) : (
              <a href="#" className={`navbar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabClick('profile')} data-tab="profile">회원정보</a>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역을 포함하는 컨테이너입니다. 사이드바와 메인 콘텐츠로 나뉩니다. */}
      <div className="main-container">
        {/* 사이드바 영역입니다. 로그인 상태일 때만 표시합니다. */}
        {isLoggedIn && (
          <aside className="sidebar">
            {/* 건물 선택 드롭다운 섹션입니다. */}
            <div className="sidebar-section">
              <label className="form-label">건물 선택</label>
              <select className="form-control" id="buildingSelect" value={selectedBuildingId} onChange={handleBuildingSelect}>
                {/* powerData.buildings 배열을 순회하며 각 건물을 드롭다운 옵션으로 렌더링합니다. */}
                {powerData.buildings.map(building => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>

            {/* 빠른 알림 섹션입니다. */}
            <div className="sidebar-section">
              <h4>빠른 알림</h4>
              <div className="quick-alerts" id="quickAlerts">
                {/* quickAlerts 상태를 순회하며 각 알림을 간략하게 표시합니다. */}
                {quickAlerts.map(alert => (
                  <div key={alert.id} className={`quick-alert quick-alert--${alert.type}`}>
                    <div style={{fontWeight: 500, marginBottom: '4px'}}>{alert.title}</div>
                    <div style={{fontSize: '11px', opacity: 0.8}}>{alert.time}</div>
                    {/* 알림 카드 닫기 버튼 */}
                    <button
                      className="quick-alert-close-btn"
                      onClick={() => handleDismissAlert(alert.id)}
                      aria-label="알림 닫기"
                    >
                      &times; {/* HTML 엔티티로 'X' 문자 표시 */}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 절감 제안 섹션입니다. */}
            <div className="sidebar-section">
              <h4>절감 제안</h4>
              <div className="savings-summary" id="savingsSummary">
                {/* savingsGuides 상태의 처음 두 항목만 가져와 표시합니다. */}
                {savingsGuides.slice(0, 2).map((guide, index) => (
                  <div key={index} className="savings-item">
                    <div style={{fontWeight: 500, marginBottom: '4px'}}>{guide.action}</div>
                    <div className="savings-value">{guide.expected_saving} 절감 가능</div>
                    {/* 절감 제안 카드 닫기 버튼 */}
                    <button
                      className="quick-alert-close-btn" // 동일한 스타일 재사용
                      onClick={() => handleDismissGuide(index)} // 인덱스로 제거
                      aria-label="절감 제안 닫기"
                    >
                      &times; {/* HTML 엔티티로 'X' 문자 표시 */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* 메인 콘텐츠 영역입니다. activeTab 값에 따라 다른 컴포넌트가 조건부로 렌더링됩니다. */}
        <main className="main-content">
          {/* 로그인 상태일 때만 대시보드 및 기타 페이지를 표시합니다. */}
          {isLoggedIn ? (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard currentPower={{ usage: currentUsage, percentage: usagePercentage, capacity: powerData.current_power.capacity }} todayUsage={powerData.today_usage} tomorrowPrediction={powerData.tomorrow_prediction} stats={powerData.stats} selectedBuildingData={currentBuildingData} />
              )}

              {activeTab === 'monitoring' && (
                <BuildingMonitoring buildings={powerData.buildings} />
              )}

              {activeTab === 'alerts' && (
                <Alerts alerts={quickAlerts} />
              )}

              {activeTab === 'guide' && (
                <Guide guides={savingsGuides} />
              )}

              {activeTab === 'settings' && (
                <Settings setActiveTab={setActiveTab} />
              )}

              {activeTab === 'profile' && (
                <ProfilePage onLogout={handleLogout} /> 
              )}
            </>
          ) : (
            // 로그인 상태가 아닐 때는 AuthPage만 표시합니다.
            <AuthPage setActiveTab={setActiveTab} onLoginSuccess={handleLoginSuccess} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
