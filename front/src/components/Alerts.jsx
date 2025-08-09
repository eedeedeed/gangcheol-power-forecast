// src/components/Alerts.jsx
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../hooks/AppContext';

function Alerts({ alerts }) {
  const { highlightedAlertId, setHighlightedAlertId, handleDismissAlert } = useContext(AppContext);

  useEffect(() => {
    if (highlightedAlertId) {
      const timer = setTimeout(() => {
        setHighlightedAlertId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightedAlertId, setHighlightedAlertId]);

  return (
    <div id="alerts">
      <div className="alerts-container" id="alertsContainer">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`alert-card alert-card--${alert.type} ${alert.id === highlightedAlertId ? 'blink' : ''}`}
          >
            <div className="alert-header">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-meta">
                <div className="alert-time">{alert.time}</div>
                <button 
                  onClick={() => handleDismissAlert(alert.id)} 
                  className="card-close-btn"
                  aria-label="알림 닫기"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="alert-message">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
