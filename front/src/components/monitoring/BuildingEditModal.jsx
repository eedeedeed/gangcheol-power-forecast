import React from 'react';
import { useBuildingForm } from '../../hooks/useBuildingForm';
import BuildingForm from './BuildingForm'; // 새로 만든 폼 컴포넌트 import

function BuildingEditModal({ isOpen, onClose, onSave, initialData = null }) {
  // 폼 관련 상태와 핸들러는 모두 useBuildingForm 훅에서 가져옵니다.
  const { 
    building, otherTypeName, showOtherType, 
    handleInputChange, handleOtherTypeNameChange, handleAddressSearch, getFormData, resetForm
  } = useBuildingForm(initialData);
  
  if (!isOpen) return null;

  // 저장 버튼 클릭 시 실행될 함수
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!building.name || !building.type || !building.area || !building.coolingArea || !building.address) {
      alert('필수 입력 항목(*)을 모두 채워주세요.');
      return;
    }

    onSave(getFormData()); // 최종 데이터를 부모에게 전달
    if (!initialData) { // 새 건물 등록일 경우에만 폼을 리셋
      resetForm();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{initialData ? '건물 정보 수정' : '새 건물 등록'}</h4>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {/* form 태그로 전체를 감싸고, onSubmit 핸들러 연결 */}
          <form onSubmit={handleSubmit}>
            {/* 폼 UI 부분을 BuildingForm 컴포넌트로 교체 */}
            <BuildingForm
              form={building}
              onFormChange={handleInputChange}
              otherTypeName={otherTypeName}
              onOtherTypeNameChange={handleOtherTypeNameChange}
              showOtherType={showOtherType}
              onAddressSearch={handleAddressSearch}
            />
            <div className="modal-footer">
              <button type="submit" className="btn btn--primary">{initialData ? '수정 완료' : '등록'}</button>
              <button type="button" className="btn btn--secondary" onClick={onClose}>취소</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuildingEditModal;