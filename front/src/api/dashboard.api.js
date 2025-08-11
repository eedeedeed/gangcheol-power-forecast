import axiosInstance from './axiosInstance';

export const getDashboardData = (buildingId) => {
  return axiosInstance.get(`/dashboard/${buildingId}`);
};