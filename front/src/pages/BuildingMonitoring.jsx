import React, { useState, useContext } from 'react';
import { BuildingContext } from '../contexts/BuildingContext';
import BuildingDetailsModal from '../components/monitoring/BuildingDetailsModal';
import BuildingEditModal from '../components/monitoring/BuildingEditModal';
import * as buildingApi from '../api/building.api'; // buildingApi 직접 임포트

function BuildingMonitoring() {
  const { buildings, handleBuildingAdd, handleBuildingUpdate, handleBuildingDelete } = useContext(BuildingContext);
  
  const [modalState, setModalState] = useState({ type: null, data: null });

  // 수정/추가 후 저장 로직
  const handleSaveBuilding = async (buildingData) => {
    if (modalState.type === 'add') {
      await handleBuildingAdd(buildingData);
      closeModal();
    } else if (modalState.type === 'edit') {
      await handleBuildingUpdate(buildingData);
      // 수정이 완료되면, 업데이트된 buildings 리스트에서 해당 건물을 찾습니다.
      const updatedBuilding = buildings.find(b => b.building_id === buildingData.building_id);
      // 세부 정보 모달을 최신 정보로 다시 엽니다.
      setModalState({ type: 'details', data: updatedBuilding || buildingData });
    }
  };

  // 삭제 로직
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
                  <th></th>
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
                      등록된 건물이 없습니다. 하단의 '+' 버튼을 눌러 건물을 추가하세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="add-building-btn-container" style={{textAlign: "center", marginTop: "20px"}}>
            <button onClick={() => setModalState({ type: 'add', data: null })} className="add-building-btn">+</button>
          </div>
        </div>
      </div>

      {/* 세부정보 모달 */}
      <BuildingDetailsModal
        building={modalState.type === 'details' ? modalState.data : null}
        onClose={closeModal}
        onEdit={async (building) => {
          try {
            console.log(`[수정 시작] ${building.building_id}번 건물의 최신 정보를 가져옵니다.`);
            // [수정] getBuildingForUpdate 함수를 호출합니다.
            const response = await buildingApi.getBuildingForUpdate(building.building_id); 
            
            const latestBuildingData = response.data.rows[0]; 
            console.log('[수정 시작] 최신 건물 정보:', latestBuildingData);

            setModalState({ type: 'edit', data: latestBuildingData });

          } catch (error) {
            console.error('수정 모달을 열기 전 최신 정보를 가져오는 데 실패했습니다.', error);
            setModalState({ type: 'edit', data: building });
          }
        }}
        onDelete={handleDeleteBuilding}
      />
      
      {/* 추가/수정 모달 */}
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
