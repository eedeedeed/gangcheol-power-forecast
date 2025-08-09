// src/components/BuildingMonitoring.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../hooks/AppContext';
import '../styles/monitoring.css';
import axios from 'axios';
import { buildingRegister } from '../service/authApi';


function BuildingMonitoring() {
  const {
    buildings,
    handleBuildingAdd,
    handleBuildingUpdate,
    handleBuildingDelete
  } = useContext(AppContext);

  // --- 상태(State) 선언 ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    building_name: '',
    building_type: '',
    total_area: '',
    cooling_area: '',
    pcs_capacity: '',
    ess_capacity: '',
    pv_capacity: '',
    building_address: '',   // 기본 주소
    detailAddress: '',      // 상세 주소
  });
    const [editingBuildingId, setEditingBuildingId] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBuildingForDetails, setSelectedBuildingForDetails] = useState(null);

  const [showOtherType, setShowOtherType] = useState(false);
  const [otherTypeName, setOtherTypeName] = useState('');
  const [coolingRatio, setCoolingRatio] = useState(0);

  // --- useEffect 훅 ---
  useEffect(() => {
    const area = parseFloat(newBuilding.area);
    const coolingArea = parseFloat(newBuilding.coolingArea);
    if (area > 0 && coolingArea >= 0) {
      setCoolingRatio(((coolingArea / area) * 100).toFixed(1));
    } else {
      setCoolingRatio(0);
    }
  }, [newBuilding.area, newBuilding.coolingArea]);

  useEffect(() => {
    setShowOtherType(newBuilding.type === '기타');
    if (newBuilding.type !== '기타') setOtherTypeName('');
  }, [newBuilding.type]);

  // --- 핸들러 함수 ---
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewBuilding(prev => ({ ...prev, [name]: value }));

  // 건물유형 '기타' 선택 시 보조 입력 표시
  if (name === 'building_type') {
    setShowOtherType(value === '기타');
  }
};

// 주소 검색 → 주소/상세주소 합쳐서 building_address에 넣기
const handleDaumAddressSearch = () => {
  if (!window.daum || !window.daum.Postcode) {
    alert('주소 검색 스크립트가 로드되지 않았습니다.');
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      const baseAddr = data.roadAddress || data.jibunAddress || '';
      const zonecode = data.zonecode || '';
      setNewBuilding(prev => ({
        ...prev,
        building_address: baseAddr, // 기본 주소만 넣기
        zip_code: zonecode,
      }));
      // 상세주소 입력창으로 포커스 이동 (선택)
      setTimeout(() => document.getElementById('detailAddress')?.focus(), 0);
    },
  }).open();
};


  const resetModalState = () => {
    setNewBuilding({
      id: null, name: '', type: '', area: '', coolingArea: '', solarCapacity: '',
      essCapacity: '', pcsCapacity: '', address: '', detailAddress: '', zipCode: ''
    });
    setEditingBuildingId(null);
    setShowOtherType(false);
    setOtherTypeName('');
  };

  const openAddModal = () => {
    resetModalState();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (building) => {
    resetModalState();
    setNewBuilding(building);
    setEditingBuildingId(building.id);
    const standardTypes = ['아파트', '상업', '백화점', '병원', '호텔', '전화국(IDC)', '연구소', '공공', '학교'];
    if (building.type && !standardTypes.includes(building.type)) {
      setNewBuilding(prev => ({ ...prev, type: '기타' }));
      setOtherTypeName(building.type);
    }
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => setIsEditModalOpen(false);
  
  const openDetailsModal = (building) => {
    setSelectedBuildingForDetails(building);
    setIsDetailsModalOpen(true);
  };
  
  const closeDetailsModal = () => {
    setSelectedBuildingForDetails(null);
    setIsDetailsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 기타 유형 입력 반영
    const payload = {
      ...newBuilding,
      building_type: newBuilding.building_type === '기타' && otherTypeName
        ? otherTypeName
        : newBuilding.building_type,
      // 숫자 필드 Number 변환
      total_area: Number(newBuilding.total_area),
      cooling_area: Number(newBuilding.cooling_area),
      pcs_capacity: Number(newBuilding.pcs_capacity || 0),
      ess_capacity: Number(newBuilding.ess_capacity || 0),
      pv_capacity: Number(newBuilding.pv_capacity || 0),
    };

    // 프리체크(백엔드와 동일 룰)
    if (!(payload.total_area > 0)) return alert('연면적은 0보다 커야 합니다.');
    if (payload.cooling_area < 0 || payload.cooling_area > payload.total_area)
      return alert('냉방면적은 0 이상이고 연면적 이하여야 합니다.');
    if (!payload.building_address) return alert('주소를 입력/선택하세요.');

    try {
      await buildingRegister(payload)
      // 성공 처리
      closeAddModal();
    } catch (err) {
      console.error('건물 등록 실패:', err);
      alert(err?.response?.data?.error || '건물 등록에 실패했습니다.');
    }
};



  const handleDeleteClick = (buildingId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      handleBuildingDelete(buildingId);
      closeDetailsModal();
    }
  };

  const buildingTypes = ['아파트', '상업', '백화점', '병원', '호텔', '전화국(IDC)', '연구소', '공공', '학교', '기타'];

  return (
    <div id="monitoring">
      <div className="building-management-section">
        <div className="management-card">
          <h4>등록된 건물 목록</h4>
          <div className="table-responsive">
            <table className="building-management-table">
              <thead>
                <tr>
                  <th></th>
                  <th>건물명</th>
                  <th>유형</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id}>
                    <td>{building.id}</td>
                    <td>{building.name}</td>
                    <td>{building.type || 'N/A'}</td>
                    <td className="actions">
                      <button onClick={() => openDetailsModal(building)} className="btn btn--secondary">
                        세부정보
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-building-btn-container">
            <button onClick={openAddModal} className="add-building-btn">+</button>
          </div>
        </div>

        {isDetailsModalOpen && selectedBuildingForDetails && (() => {
          const area = parseFloat(selectedBuildingForDetails.area);
          const coolingArea = parseFloat(selectedBuildingForDetails.coolingArea);
          let detailsCoolingRatio = 0;
          if (area > 0 && !isNaN(area) && coolingArea >= 0 && !isNaN(coolingArea)) {
            detailsCoolingRatio = ((coolingArea / area) * 100).toFixed(1);
          }

          return (
            <div className="modal-backdrop" onClick={closeDetailsModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>{selectedBuildingForDetails.name} - 세부 정보</h4>
                  <button onClick={closeDetailsModal} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body details-modal-body" style={{ padding: '20px' }}>
                  <p><strong>건물명:</strong> {selectedBuildingForDetails.name || 'N/A'}</p>
                  <p><strong>건물유형:</strong> {selectedBuildingForDetails.type || 'N/A'}</p>
                  <p><strong>연면적(㎡):</strong> {selectedBuildingForDetails.area ? `${Number(selectedBuildingForDetails.area).toLocaleString()} ㎡` : 'N/A'}</p>
                  <p><strong>냉방면적(㎡):</strong> {selectedBuildingForDetails.coolingArea ? `${Number(selectedBuildingForDetails.coolingArea).toLocaleString()} ㎡` : 'N/A'}</p>
                  <p><strong>냉방비율:</strong> {detailsCoolingRatio} %</p>
                  {selectedBuildingForDetails.pcsCapacity && (<p><strong>PCS용량(kW):</strong> {selectedBuildingForDetails.pcsCapacity} kW</p>)}
                  {selectedBuildingForDetails.essCapacity && (<p><strong>ESS저장용량(kWh):</strong> {selectedBuildingForDetails.essCapacity} kWh</p>)}
                  {selectedBuildingForDetails.solarCapacity && (<p><strong>태양광용량(kW):</strong> {selectedBuildingForDetails.solarCapacity} kW</p>)}
                  <p><strong>건물주소:</strong> {selectedBuildingForDetails.address || 'N/A'}</p>
                  {selectedBuildingForDetails.detailAddress && (<p><strong>상세주소:</strong> {selectedBuildingForDetails.detailAddress}</p>)}
                </div>
                <div className="details-modal-actions">
                  <button onClick={() => { closeDetailsModal(); openEditModal(selectedBuildingForDetails); }} className="btn btn--secondary">수정</button>
                  <button onClick={() => handleDeleteClick(selectedBuildingForDetails.id)} className="btn btn--destructive">삭제</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 새 건물 등록 모달 */}
        {isAddModalOpen && (
          <div className="modal-backdrop" onClick={closeAddModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h4>새 건물 등록</h4>
                <button onClick={closeAddModal} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} className="building-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="required">건물명</label>
                      <input
                        type="text"
                        name="building_name"
                        value={newBuilding.building_name}
                        onChange={handleInputChange}
                        required
                        placeholder="건물명을 입력하세요"
                      />
                    </div>

                    <div className="form-group">
                      <label className="required">건물유형</label>
                      <select
                        name="building_type"
                        value={newBuilding.building_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">선택하세요</option>
                        {buildingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    {showOtherType && (
                      <div className="form-group">
                        <label>기타 유형명</label>
                        <input
                          type="text"
                          value={otherTypeName}
                          onChange={(e) => setOtherTypeName(e.target.value)}
                          placeholder="건물 유형을 직접 입력하세요"
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="required">연면적(㎡)</label>
                      <input
                        type="number"
                        name="total_area"
                        value={newBuilding.total_area}
                        onChange={handleInputChange}
                        required
                        placeholder="연면적을 입력하세요"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="required">냉방면적(㎡)</label>
                      <input
                        type="number"
                        name="cooling_area"
                        value={newBuilding.cooling_area}
                        onChange={handleInputChange}
                        required
                        placeholder="냉방면적을 입력하세요"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>냉방비율</label>
                      <div style={{ flexGrow: 1, textAlign: 'left', padding: '12px 0' }}>
                        {/* 표시만: DB가 최종 계산 */}
                        {Number(newBuilding.total_area) > 0
                          ? ((Number(newBuilding.cooling_area || 0) / Number(newBuilding.total_area)) * 100).toFixed(2)
                          : 0} %
                      </div>
                    </div>

                    <div className="form-group">
                      <label>PCS용량(kW)</label>
                      <input
                        className="form-control"
                        type="number"
                        name="pcs_capacity"
                        value={newBuilding.pcs_capacity}
                        onChange={handleInputChange}
                        placeholder="PCS용량을 입력하세요"
                        min="0" step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label>ESS저장용량(kWh)</label>
                      <input
                        className="form-control"
                        type="number"
                        name="ess_capacity"
                        value={newBuilding.ess_capacity}
                        onChange={handleInputChange}
                        placeholder="ESS저장용량을 입력하세요"
                        min="0" step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label>태양광용량(kW)</label>
                      <input
                        className="form-control"
                        type="number"
                        name="pv_capacity"
                        value={newBuilding.pv_capacity}
                        onChange={handleInputChange}
                        placeholder="태양광용량을 입력하세요"
                        min="0" step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="required">건물주소</label>
                      <div className="address-container">
                        <div className="address-field">
                          <input
                            type="text"
                            name="zip_code"
                            value={newBuilding.zip_code}
                            readOnly
                            placeholder="우편번호"
                            className="form-control zip-code-input"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleDaumAddressSearch}
                            className="btn btn--secondary address-search-btn"
                          >
                            주소 검색
                          </button>
                        </div>
                        <input
                          type="text"
                          name="building_address"
                          value={newBuilding.building_address}
                          onChange={handleInputChange}
                          placeholder="주소 (상세 포함)"
                          className="form-control"
                          readOnly
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-submit">
                    <button type="submit" className="btn btn--primary">등록</button>
                    <button type="button" className="btn btn--secondary" onClick={closeAddModal}>취소</button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* 건물 정보 수정 모달 */}
        {isEditModalOpen && (
          <div className="modal-backdrop" onClick={closeEditModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h4>건물 정보 수정</h4>
                <button onClick={closeEditModal} className="modal-close-btn">&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} className="building-form">
                  <div className="form-row">
                    <div className="form-group"><label>건물명</label><input type="text" name="name" value={newBuilding.name} onChange={handleInputChange} placeholder="건물명을 입력하세요" /></div>
                    <div className="form-group"><label>건물유형</label><select name="type" value={newBuilding.type} onChange={handleInputChange}><option value="">선택하세요</option>{buildingTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                    {showOtherType && (<div className="form-group"><label>기타 유형명</label><input type="text" value={otherTypeName} onChange={(e) => setOtherTypeName(e.target.value)} placeholder="건물 유형을 직접 입력하세요" /></div>)}
                    <div className="form-group"><label>연면적(㎡)</label><input type="number" name="area" value={newBuilding.area} onChange={handleInputChange} placeholder="연면적을 입력하세요" min="1" /></div>
                    <div className="form-group"><label>냉방면적(㎡)</label><input type="number" name="coolingArea" value={newBuilding.coolingArea} onChange={handleInputChange} placeholder="냉방면적을 입력하세요" min="0" /></div>
                    <div className="form-group"><label>냉방비율</label><div style={{ flexGrow: 1, textAlign: 'left', padding: '12px 0' }}>{coolingRatio} %</div></div>
                    <div className="form-group"><label>PCS용량(kW)</label><input className="form-control" type="number" name="pcsCapacity" value={newBuilding.pcsCapacity} onChange={handleInputChange} placeholder="PCS용량을 입력하세요" min="0" step="0.1" /></div>
                    <div className="form-group"><label>ESS저장용량(kWh)</label><input className="form-control" type="number" name="essCapacity" value={newBuilding.essCapacity} onChange={handleInputChange} placeholder="ESS저장용량을 입력하세요" min="0" step="0.1" /></div>
                    <div className="form-group"><label>태양광용량(kW)</label><input className="form-control" type="number" name="solarCapacity" value={newBuilding.solarCapacity} onChange={handleInputChange} placeholder="태양광용량을 입력하세요" min="0" step="0.1" /></div>
                    <div className="form-group">
                      <label>건물주소</label>
                      <div className="address-container">
                        <div className="address-field">
                          <input type="text" name="zipCode" value={newBuilding.zipCode} readOnly placeholder="우편번호" className="form-control zip-code-input"/>
                          <button type="button" onClick={handleDaumAddressSearch} className="btn btn--secondary address-search-btn">주소 검색</button>
                        </div>
                        <input type="text" name="address" value={newBuilding.address} onChange={handleInputChange} placeholder="주소" className="form-control" readOnly />
                        <input type="text" id="detailAddress" name="detailAddress" value={newBuilding.detailAddress} onChange={handleInputChange} placeholder="상세주소를 입력하세요 (동, 호수 등)" className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="form-submit">
                    <button type="submit" className="btn btn--primary">수정 완료</button>
                    <button type="button" className="btn btn--secondary" onClick={closeEditModal}>취소</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildingMonitoring;
