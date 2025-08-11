// src/pages/Alerts.jsx
import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

function Alerts() {
  // 이제 props 대신 NotificationContext에서 직접 데이터를 가져옵니다.
  const { alerts, highlightedAlertId, setHighlightedAlertId, handleDismissAlert } = useContext(NotificationContext);

  useEffect(() => {
    if (highlightedAlertId) {
      const timer = setTimeout(() => {
        setHighlightedAlertId(null);
      }, 1000); // 1초 후 하이라이트 효과 제거
      return () => clearTimeout(timer);
    }
  }, [highlightedAlertId, setHighlightedAlertId]);

  return (
    <div id="alerts">
      <div className="alerts-container">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`alert-card alert-card--${alert.type} ${alert.id === highlightedAlertId ? 'blink' : ''}`}>
            <div className="alert-header">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-meta">
                <div className="alert-time">{alert.time}</div>
                <button onClick={() => handleDismissAlert(alert.id)} className="card-close-btn">&times;</button>
              </div>
            </div>
            <div className="alert-message">{alert.message}</div>
          </div>
        )) : <p>표시할 알림이 없습니다.</p>}
      </div>
    </div>
  );
}

export default Alerts;