import React, { useState, useContext } from 'react';
import { BuildingContext } from '../contexts/BuildingContext';
import BuildingDetailsModal from '../components/monitoring/BuildingDetailsModal';
import BuildingEditModal from '../components/monitoring/BuildingEditModal';

function BuildingMonitoring() {
  const { buildings, handleBuildingAdd, handleBuildingUpdate, handleBuildingDelete } = useContext(BuildingContext);
  
  const [modalState, setModalState] = useState({ type: null, data: null });

  const handleSaveBuilding = (buildingData) => {
    if (modalState.type === 'add') {
      handleBuildingAdd(buildingData);
    } else if (modalState.type === 'edit') {
      handleBuildingUpdate(buildingData);
    }
    closeModal();
  };

  const handleDeleteBuilding = (buildingId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      handleBuildingDelete(buildingId);
    }
    closeModal();
  };

  const closeModal = () => setModalState({ type: null, data: null });

  return (
    <div id="monitoring">
      <div className="building-management-section">
        <div className="management-card">
          <h4>등록된 건물 목록</h4>
          <div className="table-responsive">
            <table className="building-management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>건물명</th>
                  <th>유형</th>
                  <th>세부정보</th>
                </tr>
              </thead>
              <tbody>
                {buildings.length > 0 ? (
                  buildings.map((building) => (
                    <tr key={building.building_id}>
                      <td>{building.building_id}</td>
                      <td>{building.building_name}</td>
                      <td>{building.building_type || 'N/A'}</td>
                      <td className="actions">
                        <button onClick={() => setModalState({ type: 'details', data: building })} className="btn btn--secondary btn--sm">
                          세부정보 보기
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      등록된 건물이 없습니다. 우측 하단의 '+' 버튼을 눌러 건물을 추가하세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="add-building-btn-container" style={{textAlign: "right", marginTop: "20px"}}>
            <button onClick={() => setModalState({ type: 'add', data: null })} className="add-building-btn">+</button>
          </div>
        </div>
      </div>

      <BuildingDetailsModal
        building={modalState.type === 'details' ? modalState.data : null}
        onClose={closeModal}
        onEdit={() => setModalState({ type: 'edit', data: modalState.data })}
        onDelete={handleDeleteBuilding}
      />
      
      <BuildingEditModal 
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={closeModal}
        onSave={handleSaveBuilding}
        initialData={modalState.type === 'edit' ? modalState.data : null}
      />
    </div>
  );
}

export default BuildingMonitoring;