// src/components/BuildingMonitoring.jsx

import React, { useState } from 'react';
import { powerData } from '../data';
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
    address: '', // 위도/경도 대신 주소 필드
  });
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  
  // 주소 검색 관련 상태
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBuilding(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 주소 검색 함수 (OpenStreetMap Nominatim API 사용)
  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      // Nominatim API를 사용한 주소 검색
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&countrycodes=kr&limit=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('주소 검색에 실패했습니다.');
      }
      
      const data = await response.json();
      setAddressResults(data);
      
      if (data.length === 0) {
        alert('검색된 주소가 없습니다. 다른 키워드로 검색해보세요.');
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
      setAddressResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 주소 선택 함수 (도로명 주소만 저장)
  const handleSelectAddress = (address) => {
    setNewBuilding(prev => ({
      ...prev,
      address: address.display_name // 도로명 주소만 저장
    }));
    setAddressQuery('');
    setAddressResults([]);
  };

  // Enter 키 눌렀을 때 검색 실행
  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddressSearch();
    }
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
    
    // 폼 초기화
    setNewBuilding({
      id: null, name: '', type: '', area: '', coolingArea: '', solarCapacity: '',
      essCapacity: '', pcsCapacity: '', address: ''
    });
    setAddressQuery('');
    setAddressResults([]);
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

  const handleCancelEdit = () => {
    setEditingBuildingId(null);
    setNewBuilding({
      id: null, name: '', type: '', area: '', coolingArea: '', solarCapacity: '',
      essCapacity: '', pcsCapacity: '', address: ''
    });
    setAddressQuery('');
    setAddressResults([]);
  };

  return (
    <div id="monitoring">
      {/* 건물 관리 기능 */}
      <div className="building-management-section">
        <h3>건물 관리</h3>
        <div className="management-card">
          <h4>{editingBuildingId ? '건물 정보 수정' : '새 건물 등록'}</h4>
          <form onSubmit={handleSubmit} className="building-form">
            <div className="form-group">
              <label className="required">건물명</label>
              <input 
                type="text" 
                name="name" 
                value={newBuilding.name} 
                onChange={handleInputChange} 
                required 
                placeholder="건물명을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label className="required">건물유형</label>
              <select name="type" value={newBuilding.type} onChange={handleInputChange} required>
                <option value="">선택하세요</option>
                <option value="사무동">사무동</option>
                <option value="연구시설">연구시설</option>
                <option value="생산시설">생산시설</option>
                <option value="상업시설">상업시설</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="required">연면적(㎡)</label>
              <input 
                type="number" 
                name="area" 
                value={newBuilding.area} 
                onChange={handleInputChange} 
                required 
                placeholder="연면적을 입력하세요"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>냉방면적(㎡)</label>
              <input 
                type="number" 
                name="coolingArea" 
                value={newBuilding.coolingArea} 
                onChange={handleInputChange} 
                placeholder="냉방면적을 입력하세요"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>태양광용량(kW)</label>
              <input 
                type="number" 
                name="solarCapacity" 
                value={newBuilding.solarCapacity} 
                onChange={handleInputChange} 
                placeholder="태양광용량을 입력하세요"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>ESS저장용량(kWh)</label>
              <input 
                type="number" 
                name="essCapacity" 
                value={newBuilding.essCapacity} 
                onChange={handleInputChange} 
                placeholder="ESS저장용량을 입력하세요"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>PCS용량(kW)</label>
              <input 
                type="number" 
                name="pcsCapacity" 
                value={newBuilding.pcsCapacity} 
                onChange={handleInputChange} 
                placeholder="PCS용량을 입력하세요"
                min="0"
                step="0.1"
              />
            </div>

            {/* 주소 검색 섹션 - 간소화 */}
            <div className="form-group address-search-section">
              <label>건물 주소</label>
              
              {/* 주소 직접 입력 */}
              <input
                type="text"
                name="address"
                value={newBuilding.address}
                onChange={handleInputChange}
                placeholder="주소를 직접 입력하거나 아래에서 검색하세요"
                className="address-direct-input"
              />

              {/* 주소 검색 */}
              <div className="address-search-container">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={handleAddressKeyDown}
                  placeholder="예: 서울특별시 강남구 테헤란로 123"
                  className="address-input"
                />
                <button 
                  type="button" 
                  onClick={handleAddressSearch}
                  disabled={isSearching}
                  className="btn btn--secondary address-search-btn"
                >
                  {isSearching ? '검색중...' : '검색'}
                </button>
              </div>

              {/* 검색 결과 목록 */}
              {addressResults.length > 0 && (
                <div className="address-results">
                  <div className="address-results-header">검색 결과 (클릭하여 선택)</div>
                  <ul className="address-results-list">
                    {addressResults.map((address, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSelectAddress(address)}
                        className="address-result-item"
                      >
                        <div className="address-name">{address.display_name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="address-help">
                💡 주소를 직접 입력하거나, 검색을 통해 정확한 주소를 찾을 수 있습니다.
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editingBuildingId ? '수정 완료' : '등록'}
              </button>
              {editingBuildingId && (
                <button 
                  type="button" 
                  className="btn btn--secondary" 
                  onClick={handleCancelEdit}
                >
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
                  <th>주소</th>
                  <th>태양광(kW)</th>
                  <th>ESS(kWh)</th>
                  <th>PCS(kW)</th>
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
                    <td className="address-cell">{building.address || 'N/A'}</td>
                    <td>{building.solarCapacity || 'N/A'}</td>
                    <td>{building.essCapacity || 'N/A'}</td>
                    <td>{building.pcsCapacity || 'N/A'}</td>
                    <td className="actions">
                      <button 
                        onClick={() => handleEditClick(building)} 
                        className="btn btn--info"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(building.id)} 
                        className="btn btn--warning"
                      >
                        삭제
                      </button>
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
