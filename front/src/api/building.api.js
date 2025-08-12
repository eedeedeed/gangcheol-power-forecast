import axiosInstance from './axiosInstance';

export const buildingRegister = (data) => {
  return axiosInstance.post('/building/register', data);
};

// building.api.js 건물 조회하는거. 데이터베이스에서 가져오는거 
export const getBuildings = (adminId) => {
  return axiosInstance.get(`/building/getbuildings/${adminId}`); // id → adminId로 수정
}


// export const getBuildings = () => {
//   return axiosInstance.get('/building');
// };

// export const updateBuilding = (id, data) => {
//   return axiosInstance.put(`/building/${id}`, data);
// };

// export const deleteBuilding = (id) => {
//   return axiosInstance.delete(`/building/${id}`);
// };