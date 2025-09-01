import React, { useState, useContext } from 'react';
import { BuildingContext } from '../contexts/BuildingContext';
import BuildingDetailsModal from '../components/monitoring/BuildingDetailsModal';
import BuildingEditModal from '../components/monitoring/BuildingEditModal';
import * as buildingApi from '../api/building.api'; 

function BuildingMonitoring() {
  const { buildings, handleBuildingAdd, handleBuildingUpdate, handleBuildingDelete } = useContext(BuildingContext);
  
  const [modalState, setModalState] = useState({ type: null, data: null });

  // ✅ [수정] 수정 후 로직 변경
  const handleSaveBuilding = async (buildingData) => {
    if (modalState.type === 'add') {
      await handleBuildingAdd(buildingData);
      closeModal();
    } else if (modalState.type === 'edit') {
      try {
        await handleBuildingUpdate(buildingData);
        
        // 수정이 성공하면, 서버에 보냈던 최신 데이터(buildingData)로
        // 세부 정보 모달의 상태를 즉시 업데이트합니다.
        // 이렇게 하면 모달을 다시 열 필요 없이 변경사항이 바로 반영됩니다.
        setModalState({ type: 'details', data: buildingData });

      } catch (error) {
        console.error("건물 정보 저장에 실패했습니다.", error);
        // 필요하다면 이곳에서 사용자에게 에러 알림을 띄울 수 있습니다.
      }
    }
  };

  const handleDeleteBuilding = (buildingId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      handleBuildingDelete(buildingId);
    }
    closeModal();
  };

  const closeModal = () => setModalState({ type: null, data: null });

  // ✅ [수정] onEdit 로직 변경 (이전 답변에서 제안된 임시방편 적용)
  const handleEditClick = (building) => {
    // API를 호출하여 최신 데이터를 가져오는 대신,
    // 현재 목록에 있는 데이터를 기반으로 수정 모달을 엽니다.
    // (API 404 오류를 우회하기 위함)
    console.log(`[수정 시작] API 호출 없이 기존 데이터로 수정 모달을 엽니다.`, building);
    setModalState({ type: 'edit', data: building });
  };


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
                  <th>건물 주소</th>
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
                      <td>{building.building_address || 'N/A'}</td>
                      <td className="actions">
                        <button onClick={() => setModalState({ type: 'details', data: building })} className="btn btn--secondary btn--sm">
                          세부정보 보기
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
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
        onEdit={handleEditClick} // ✅ [수정] onEdit에 연결된 함수 변경
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