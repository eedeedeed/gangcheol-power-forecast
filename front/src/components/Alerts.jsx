// src/components/Alerts.jsx
// 이 파일은 애플리케이션의 알림 관리 컴포넌트입니다.
// 다양한 유형의 알림(경고, 정보 등)을 카드 형태로 표시합니다.

import React from 'react';

function Alerts({ alerts }) {
  // props:
  // - alerts: 표시할 알림 객체들의 배열. 각 알림 객체는 id, type(알림 유형: 'warning' 또는 'info'),
  //           title(제목), time(시간), message(내용)를 포함합니다.

  return (
    // 알림 관리 페이지의 최상위 컨테이너입니다.
    <div id="alerts">
      {/* 알림 카드들을 담는 컨테이너입니다. */}
      <div className="alerts-container" id="alertsContainer">
        {/* alerts 배열을 순회하며 각 알림에 대한 카드 컴포넌트를 렌더링합니다. */}
        {alerts.map(alert => (
          // 각 알림 카드의 고유 키는 alert.id를 사용합니다.
          // 알림 유형(alert.type)에 따라 다른 CSS 클래스(alert-card--warning 또는 alert-card--info)가 적용됩니다.
          <div key={alert.id} className={`alert-card alert-card--${alert.type}`}>
            {/* 알림 카드의 헤더 부분입니다. */}
            <div className="alert-header">
              {/* 알림 제목을 표시합니다. */}
              <div className="alert-title">{alert.title}</div>
              {/* 알림 발생 시간을 표시합니다. */}
              <div className="alert-time">{alert.time}</div>
            </div>
            {/* 알림 메시지 내용을 표시합니다. */}
            <div className="alert-message">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
