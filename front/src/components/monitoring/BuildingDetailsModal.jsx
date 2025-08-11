import React from 'react';

function BuildingDetailsModal({ building, onClose, onEdit, onDelete }) {
  if (!building) return null;

  const area = parseFloat(building.area);
  const coolingArea = parseFloat(building.coolingArea);
  let coolingRatio = '0.00';
  if (area > 0 && coolingArea >= 0) {
    coolingRatio = ((coolingArea / area) * 100).toFixed(2);
  }

  const formatNumber = (num) => num ? Number(num).toLocaleString() : 'N/A';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{building.name} - 세부 정보</h4>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          <p><strong>건물명:</strong> {building.name || 'N/A'}</p>
          <p><strong>건물유형:</strong> {building.type || 'N/A'}</p>
          <p><strong>연면적(㎡):</strong> {formatNumber(building.area)} ㎡</p>
          <p><strong>냉방면적(㎡):</strong> {formatNumber(building.coolingArea)} ㎡</p>
          <p><strong>냉방비율:</strong> {coolingRatio} %</p>
          <p><strong>PCS용량(kW):</strong> {formatNumber(building.pcsCapacity)} kW</p>
          <p><strong>ESS저장용량(kWh):</strong> {formatNumber(building.essCapacity)} kWh</p>
          <p><strong>태양광용량(kW):</strong> {formatNumber(building.solarCapacity)} kW</p>
          <p><strong>건물주소:</strong> {building.address || 'N/A'}</p>
        </div>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-border)' }}>
          {/* Link가 아닌 button 태그를 사용해야 합니다. */}
          <button onClick={() => onEdit(building)} className="btn btn--secondary">수정</button>
          <button onClick={() => onDelete(building.id)} className="btn btn--secondary">삭제</button>
          <button onClick={onClose} className="btn btn--primary">닫기</button>
        </div>
      </div>
    </div>
  );
}

export default BuildingDetailsModal;