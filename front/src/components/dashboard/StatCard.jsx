import React from 'react';

// ✅ [수정] props에 cardClass 추가
function StatCard({ title, value, description, status, statusText, valueClassName = '', isTimeCard = false, cardClass = '' }) {
  const statusMap = {
    normal: 'status--info',
    warning: 'status--warning',
    success: 'status--success',
  };

  // ✅ [수정] 최상위 div에 cardClass 적용
  return (
    <div className={`stat-card ${isTimeCard ? 'time-card' : ''} ${cardClass}`}>
      <div className="stat-header">
        <h4>{title}</h4>
        {status && statusText && (
          <span className={`status ${statusMap[status] || 'status--info'}`}>
            {statusText}
          </span>
        )}
      </div>
      <div className="stat-body">
        <p className={`current-usage-value ${valueClassName}`}>{value}</p>
        <p className="current-usage-percentage">{description}</p>
      </div>
    </div>
  );
}

export default StatCard;