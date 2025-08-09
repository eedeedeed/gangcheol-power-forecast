// src/components/layout/Sidebar.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../hooks/AppContext';

function Sidebar() {
  const {
    selectedBuildingId,
    handleBuildingSelect,
    buildings,
    quickAlerts,
    savingsGuides,
    setActiveTab,
    setHighlightedAlertId,
    setHighlightedGuideId,
    handleDismissAlert,
    handleDismissGuide, // handleDismissGuide 함수를 컨텍스트에서 가져옵니다.
  } = useContext(AppContext);

  // 알림 클릭 시 ID를 설정하고 'alerts' 탭으로 이동하는 핸들러
  const handleAlertClick = (alertId) => {
    setHighlightedAlertId(alertId);
    setActiveTab('alerts');
  };

  // 가이드 클릭 시 ID를 설정하고 'guide' 탭으로 이동하는 핸들러
  const handleGuideClick = (guideIndex) => {
    setHighlightedGuideId(guideIndex);
    setActiveTab('guide');
  };

  // 알림 닫기 버튼 클릭 핸들러
  const onDismissAlert = (e, alertId) => {
    e.stopPropagation(); // 이벤트 버블링을 막아 페이지 이동을 방지
    handleDismissAlert(alertId);
  };

  // 가이드 닫기 버튼 클릭 핸들러
  const onDismissGuide = (e, guideIndex) => {
    e.stopPropagation(); // 이벤트 버블링을 막아 페이지 이동을 방지
    handleDismissGuide(guideIndex);
  };

  return (
    <aside className="sidebar">
      {/* 건물 선택 섹션 */}
      <section className="sidebar-section">
        <h4>건물 선택</h4>
        <select value={selectedBuildingId} onChange={handleBuildingSelect} className="form-control">
          {buildings.map(building => (
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
          {quickAlerts.length > 0 ? (
            quickAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`quick-alert quick-alert--${alert.type}`}
                onClick={() => handleAlertClick(alert.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAlertClick(alert.id); }}
                role="button"
                tabIndex="0"
              >
                <span className="quick-alert-title">{alert.title}</span>
                <button 
                  onClick={(e) => onDismissAlert(e, alert.id)} 
                  className="quick-alert-close-btn"
                  aria-label="알림 닫기"
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>새로운 알림이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 절감 가이드 요약 섹션 */}
      <section className="sidebar-section">
        <h4>절감 가이드 요약</h4>
        <div className="savings-summary">
          {savingsGuides.map((guide, index) => (
            <div 
              key={index} 
              className="savings-item"
              onClick={() => handleGuideClick(index)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleGuideClick(index); }}
              role="button"
              tabIndex="0"
            >
              <span className="savings-item-action">{guide.action}</span>
              <button 
                onClick={(e) => onDismissGuide(e, index)} 
                className="quick-alert-close-btn" // 동일한 스타일 재사용
                aria-label="가이드 닫기"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
