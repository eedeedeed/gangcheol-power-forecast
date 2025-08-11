import { useState, useEffect } from 'react';

// 폼의 초기 상태 정의 (새 필드 추가)
const initialBuildingState = {
  name: '', type: '', area: '', coolingArea: '', 
  pcsCapacity: '', essCapacity: '', solarCapacity: '',
  address: '', detailAddress: '', zipCode: ''
};

export function useBuildingForm(initialData = null) {
  const [building, setBuilding] = useState(initialBuildingState);
  const [otherTypeName, setOtherTypeName] = useState('');
  const [showOtherType, setShowOtherType] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      // 수정 모드일 때, 기존 데이터와 새 필드를 합쳐 상태를 설정
      setBuilding(prev => ({ ...initialBuildingState, ...initialData }));
      
      const standardTypes = ['아파트', '상업', '백화점', '병원', '호텔', '전화국(IDC)', '연구소', '공공', '학교'];
      if (initialData.type && !standardTypes.includes(initialData.type)) {
        setBuilding(prev => ({ ...prev, type: '기타' }));
        setOtherTypeName(initialData.type);
      }
    } else {
      // 추가 모드일 때, 상태를 초기화
      setBuilding(initialBuildingState);
      setOtherTypeName('');
    }
  }, [initialData]);

  useEffect(() => {
    setShowOtherType(building.type === '기타');
    if (building.type !== '기타') setOtherTypeName('');
  }, [building.type]);

  // 폼 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuilding(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOtherTypeNameChange = (e) => setOtherTypeName(e.target.value);

  // 주소 검색 결과 처리 핸들러
  const handleAddressSearch = (data) => {
    let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
      addr += ` (${data.bname})`;
    }
    setBuilding(prev => ({
      ...prev,
      zipCode: data.zonecode,
      address: addr,
      detailAddress: ''
    }));
  };

  // 최종 제출 데이터 가공 함수
  const getFormData = () => {
    const finalAddress = building.detailAddress
      ? `${building.address} ${building.detailAddress}`
      : building.address;
    const buildingType = building.type === '기타' ? otherTypeName : building.type;
    
    // 서버에 보낼 데이터 (스네이크 케이스로 변환 및 숫자 타입 변환)
    const formData = {
      building_name: building.name,
      building_type: buildingType,
      total_area: parseFloat(building.area) || 0,
      cooling_area: parseFloat(building.coolingArea) || 0,
      pcs_capacity: parseFloat(building.pcsCapacity) || 0,
      ess_capacity: parseFloat(building.essCapacity) || 0,
      pv_capacity: parseFloat(building.solarCapacity) || 0,
      building_address: finalAddress,
      zip_code: building.zipCode,
    };
    return formData;
  };

  return {
    building,
    otherTypeName,
    showOtherType,
    handleInputChange,
    handleOtherTypeNameChange,
    handleAddressSearch,
    getFormData
  };
}