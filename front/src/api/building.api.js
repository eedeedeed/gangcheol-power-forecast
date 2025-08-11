import axiosInstance from './axiosInstance';

export const buildingRegister = (data) => {
  return axiosInstance.post('/building/register', data);
};

// building.api.js
export const getBuildings = (adminId) => {
  return axiosInstance.get(`/getbuildings/${adminId}`); // id → adminId로 수정
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