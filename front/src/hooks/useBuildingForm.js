import { useState, useEffect, useCallback } from 'react';

// 폼의 초기 상태 정의
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
      // 주소 문자열을 공백 기준으로 분리
      const addressParts = (initialData.building_address || '').split(' ');
      // 주소의 마지막 부분을 상세주소로 추정 (단어가 3개 이상일 때만)
      const detailAddressGuess = addressParts.length > 2 ? addressParts.pop() : ''; 
      // 나머지 부분을 도로명 주소로 설정
      const mainAddress = addressParts.join(' ');

      const mappedData = {
        name: initialData.building_name || '',
        type: initialData.building_type || '',
        area: initialData.total_area || '',
        coolingArea: initialData.cooling_area || '',
        pcsCapacity: initialData.pcs_capacity || '',
        essCapacity: initialData.ess_capacity || '',
        solarCapacity: initialData.pv_capacity || '',
        
        // 서버에서 오는 키 이름이 zip_code 또는 zipCode일 경우 모두 처리
        zipCode: initialData.zip_code || initialData.zipCode || '', 
        
        address: mainAddress,
        detailAddress: detailAddressGuess,
      };
      setBuilding(mappedData);
      
      const standardTypes = ['아파트', '상업', '백화점', '병원', '호텔', '전화국(IDC)', '연구소', '공공', '학교'];
      if (mappedData.type && !standardTypes.includes(mappedData.type)) {
        setBuilding(prev => ({ ...prev, type: '기타' }));
        setOtherTypeName(mappedData.type);
      }
    } else {
      // 추가 모드일 때, 상태를 초기화
      resetForm();
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
      building_id: initialData?.building_id, 
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

  const resetForm = useCallback(() => {
    setBuilding(initialBuildingState);
    setOtherTypeName('');
  }, []);

  return {
    building,
    otherTypeName,
    showOtherType,
    handleInputChange,
    handleOtherTypeNameChange,
    handleAddressSearch,
    getFormData,
    resetForm
  };
}

export default useBuildingForm;