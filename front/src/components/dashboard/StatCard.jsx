import React from 'react';

function StatCard({ title, value, description, status, statusText }) {
  const statusMap = {
    normal: 'status--info',
    warning: 'status--warning',
    success: 'status--success',
  };

  return (
    <div className="stat-card">
      <div className="stat-header">
        <h4>{title}</h4>
        {status && statusText && (
          <span className={`status ${statusMap[status] || 'status--info'}`}>
            {statusText}
          </span>
        )}
      </div>
      <div className="stat-body">
        <p className="current-usage-value">{value}</p>
        <p className="current-usage-percentage">{description}</p>
      </div>
    </div>
  );
}

export default StatCard;