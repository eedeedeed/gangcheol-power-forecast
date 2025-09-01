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
  console.log(`[API] 건물 수정 요청: PUT /building/updateBuildings/${buildingId}`, data);
  // 백엔드 라우터에 맞게 경로를 수정했습니다.
  return axiosInstance.put(`/building/updateBuildings/${buildingId}`, data);
};

// 건물수정 (수정 전 최신 데이터 가져오기)
// 이 함수는 백엔드 라우터에 별도로 정의되지 않아, 기존 getBuildings를 사용하도록 제안합니다.
export const getBuildingForUpdate = (buildingId) => {
  console.log(`[API] 수정용 건물 정보 조회 요청: GET /building/getbuildings/${buildingId}`);
  // 백엔드 라우터가 getbuildings에 adminId를 기대하므로, 이 함수는 동작하지 않을 수 있습니다.
  // getBuildingsByAdminId를 호출해야 합니다.
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