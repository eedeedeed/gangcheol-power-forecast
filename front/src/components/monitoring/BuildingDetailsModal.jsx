import React from 'react';

function BuildingDetailsModal({ building, onClose, onEdit, onDelete }) {
  if (!building) return null;

  // 백엔드 필드명에 맞게 수정: total_area, cooling_area
  const area = parseFloat(building.total_area);
  const coolingArea = parseFloat(building.cooling_area);
  let coolingRatio = '0.00';
  if (area > 0 && coolingArea >= 0) {
    coolingRatio = ((coolingArea / area) * 100).toFixed(2);
  }

  const formatNumber = (num) => num != null ? Number(num).toLocaleString() : 'N/A';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{building.building_name}</h4>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          {/* 모든 필드를 백엔드 데이터에 맞게 수정 */}
          <p><strong>건물명:</strong> {building.building_name || 'N/A'}</p>
          <p><strong>건물유형:</strong> {building.building_type || 'N/A'}</p>
          <p><strong>연면적(㎡):</strong> {formatNumber(building.total_area)} ㎡</p>
          <p><strong>냉방면적(㎡):</strong> {formatNumber(building.cooling_area)} ㎡</p>
          <p><strong>냉방비율:</strong> {coolingRatio} %</p>
          <p><strong>PCS용량(kW):</strong> {formatNumber(building.pcs_capacity)} kW</p>
          <p><strong>ESS저장용량(kWh):</strong> {formatNumber(building.ess_capacity)} kWh</p>
          <p><strong>태양광용량(kW):</strong> {formatNumber(building.pv_capacity)} kW</p>
          {/* ✅ [추가] 우편번호를 표시하는 라인 */}
          {/* <p><strong>우편번호:</strong> {building.zip_code || 'N/A'}</p> */}
          <p><strong>건물주소:</strong> {building.building_address || 'N/A'}</p>
        </div>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={() => onEdit(building)} className="btn btn--secondary">수정</button>
          {/* 삭제 시 ID도 building_id로 전달 */}
          <button onClick={() => {
            console.log(`[Modal] 삭제 버튼 클릭: building_id = ${building.building_id}`);
            onDelete(building.building_id);
          }} className="btn btn--secondary">삭제</button>
          <button onClick={onClose} className="btn btn--primary">닫기</button>
        </div>
      </div>
    </div>
  );
}

export default BuildingDetailsModal;