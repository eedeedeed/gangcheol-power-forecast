import axiosInstance from './axiosInstance';

// 건물등록
export const buildingRegister = (data) => {
  return axiosInstance.post('/building/register', data);
};

// 건물조회
export const getBuildings = (adminId) => {
  return axiosInstance.get(`/building/getbuildings/${adminId}`); // id → adminId로 수정
}

// 건물수정 (데이터 저장)
export const updateBuilding = (buildingId, data) => {
  console.log(`[API] 건물 수정 요청: PUT /building/update/${buildingId}`, data);
  // 백엔드 API 경로가 '/building/:id' 또는 '/building/update/:id' 등일 수 있습니다.
  // 우선 '/building/update/:id'로 가정하고 작성합니다.
  return axiosInstance.put(`/building/update/${buildingId}`, data);
};

// 건물수정 (수정 전 최신 데이터 가져오기)
export const getBuildingForUpdate = (buildingId) => {
  console.log(`[API] 수정용 건물 정보 조회 요청: GET /building/getbuildings/${buildingId}`);
  // 사용자 요청에 따라 /updatebuildings/ 경로를 사용했으나, getbuildings와 기능이 동일할 것으로 추정하여 통합합니다.
  return axiosInstance.get(`/building/getbuildings/${buildingId}`); 
}

// 건물삭제
export const deleteBuilding = (buildingId) => {
  const url = `/building/delete/${buildingId}`;
  console.log(`[API] 건물 삭제 요청: DELETE ${url}`);
  return axiosInstance.delete(url);
};


// export const getBuildings = () => {
//   return axiosInstance.get('/building');
// };

// export const updateBuilding = (id, data) => {
//   return axiosInstance.put(`/building/${id}`, data);
// };

// export const deleteBuilding = (id) => {
//   return axiosInstance.delete(`/building/${id}`);
// };