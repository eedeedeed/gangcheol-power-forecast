import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BuildingContext } from '../../contexts/BuildingContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext'; // ⭐️ AuthContext 추가

function Sidebar() {
  const { buildings, selectedBuildingId, setSelectedBuildingId } = useContext(BuildingContext);
  const { alerts, guides, setHighlightedAlertId, setHighlightedGuideId } = useContext(NotificationContext);
  const { user } = useContext(AuthContext); // ⭐️ AuthContext에서 user 정보 가져오기

  const handleAlertClick = (alertId) => {
    setHighlightedAlertId(alertId);
  };

  const handleGuideClick = (guideIndex) => {
    setHighlightedGuideId(guideIndex);
  };

  return (
    <aside className="sidebar">
      {/* ===== ⭐️ 사용자 정보 표시 섹션 추가 시작 ===== */}
      {user && (
        <section className="sidebar-section user-profile-section">
          <h4 className="user-profile-name">{user.ADMIN_NAME}({user.ADMIN_ID})</h4>
        </section>
      )}
      {/* ===== ⭐️ 사용자 정보 표시 섹션 추가 끝 ===== */}

      <section className="sidebar-section">
        <h4>건물 선택</h4>
        <select value={selectedBuildingId || ''} onChange={(e) => setSelectedBuildingId(Number(e.target.value))} className="form-control">
          {buildings.map(building => (<option key={building.id} value={building.id}>{building.name}</option>))}
        </select>
      </section>
      <section className="sidebar-section">
        <h4>빠른 알림</h4>
        <div className="quick-alerts">
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <Link to="/alerts" key={alert.id} className={`quick-alert quick-alert--${alert.type}`} onClick={() => handleAlertClick(alert.id)}>
                <span className="quick-alert-title">{alert.title}</span>
              </Link>
            ))
          ) : (<p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>새로운 알림이 없습니다.</p>)}
        </div>
      </section>
      <section className="sidebar-section">
        <h4>절감 가이드 요약</h4>
        <div className="savings-summary">
          {guides.length > 0 ? (
             guides.map((guide, index) => (
              <Link to="/guide" key={index} className="savings-item" onClick={() => handleGuideClick(index)}>
                <span className="savings-item-action">{guide.action}</span>
              </Link>
             ))
          ) : (<p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>절감 가이드가 없습니다.</p>)}
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;