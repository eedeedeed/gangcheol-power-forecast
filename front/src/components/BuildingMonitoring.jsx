// src/components/BuildingMonitoring.jsx

import React, { useState } from 'react';
import { powerData } from '../data'; // data.js에서 powerData를 가져옵니다.
import '../styles/monitoring.css';

function BuildingMonitoring() {
  const [buildings, setBuildings] = useState(powerData.buildings);
  const [newBuilding, setNewBuilding] = useState({
    id: null,
    name: '',
    type: '',
    area: '',
    coolingArea: '',
    solarCapacity: '',
    essCapacity: '',
    pcsCapacity: '',
    lat: '',
    lng: '',
  });
  const [editingBuildingId, setEditingBuildingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBuilding(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBuildingId) {
      setBuildings(buildings.map(b =>
        b.id === editingBuildingId ? { ...newBuilding, id: editingBuildingId } : b
      ));
      setEditingBuildingId(null);
    } else {
      const newId = buildings.length > 0 ? Math.max(...buildings.map(b => b.id)) + 1 : 1;
      setBuildings([...buildings, { ...newBuilding, id: newId, current: 0, status: 'normal' }]);
    }
    setNewBuilding({
      id: null, name: '', type: '', area: '', coolingArea: '', solarCapacity: '',
      essCapacity: '', pcsCapacity: '', lat: '', lng: ''
    });
  };

  const handleEditClick = (building) => {
    setNewBuilding(building);
    setEditingBuildingId(building.id);
  };

  const handleDeleteClick = (buildingId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setBuildings(buildings.filter(b => b.id !== buildingId));
    }
  };

  return (
    <div id="monitoring">
      {/* 기존 건물 카드형 UI */}
      <div className="building-grid" id="buildingGrid">
        {buildings.map(building => (
          <div key={building.id} className="card building-card">
            <div className="building-header">
              <div className="building-name">{building.name}</div>
              <span className={`status ${building.status === 'normal' ? 'status--info' : 'status--warning'}`}>
                {building.status === 'normal' ? '정상' : '주의'}
              </span>
            </div>
            <div className="building-usage">{building.current} <span className="building-unit">kW</span></div>
            <div className="building-details">
              <span className="building-detail-item"><strong>유형:</strong> {building.type || 'N/A'}</span>
              <span className="building-detail-item"><strong>면적:</strong> {building.area || 'N/A'}㎡</span>
              <span className="building-detail-item"><strong>태양광:</strong> {building.solarCapacity || 'N/A'} kW</span>
            </div>
          </div>
        ))}
      </div>

      {/* 건물 관리 기능 추가 */}
      <div className="building-management-section">
        <h3>건물 관리</h3>
        <div className="management-card">
          <h4>{editingBuildingId ? '건물 정보 수정' : '새 건물 등록'}</h4>
          <form onSubmit={handleSubmit} className="building-form">
            <div className="form-group">
              <label>건물명</label>
              <input type="text" name="name" value={newBuilding.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>건물유형</label>
              <input type="text" name="type" value={newBuilding.type} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>연면적(㎡)</label>
              <input type="number" name="area" value={newBuilding.area} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>냉방면적(㎡)</label>
              <input type="number" name="coolingArea" value={newBuilding.coolingArea} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>태양광용량(kW)</label>
              <input type="number" name="solarCapacity" value={newBuilding.solarCapacity} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>ESS저장용량(kWh)</label>
              <input type="number" name="essCapacity" value={newBuilding.essCapacity} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>PCS용량(kW)</label>
              <input type="number" name="pcsCapacity" value={newBuilding.pcsCapacity} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>위도</label>
              <input type="text" name="lat" value={newBuilding.lat} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>경도</label>
              <input type="text" name="lng" value={newBuilding.lng} onChange={handleInputChange} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editingBuildingId ? '수정 완료' : '등록'}
              </button>
              {editingBuildingId && (
                <button type="button" className="btn btn--secondary" onClick={() => setEditingBuildingId(null)}>
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="management-card">
          <h4>등록된 건물 목록</h4>
          <div className="table-responsive">
            <table className="building-management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>건물명</th>
                  <th>유형</th>
                  <th>연면적(㎡)</th>
                  <th>태양광(kW)</th>
                  <th>ESS(kWh)</th>
                  <th>PCS(kW)</th>
                  <th>위도</th>
                  <th>경도</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id}>
                    <td>{building.id}</td>
                    <td>{building.name}</td>
                    <td>{building.type || 'N/A'}</td>
                    <td>{building.area || 'N/A'}</td>
                    <td>{building.solarCapacity || 'N/A'}</td>
                    <td>{building.essCapacity || 'N/A'}</td>
                    <td>{building.pcsCapacity || 'N/A'}</td>
                    <td>{building.lat || 'N/A'}</td>
                    <td>{building.lng || 'N/A'}</td>
                    <td className="actions">
                      <button onClick={() => handleEditClick(building)} className="btn btn--info">수정</button>
                      <button onClick={() => handleDeleteClick(building.id)} className="btn btn--warning">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuildingMonitoring;