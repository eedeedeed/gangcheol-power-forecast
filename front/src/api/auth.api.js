import  axiosInstance  from './axiosInstance';


export const login = (ADMIN_ID, ADMIN_PASSWORD) => {
  return axiosInstance.post('/admin/login', { ADMIN_ID, ADMIN_PASSWORD });
};

export const register = (data) => {
  return axiosInstance.post('/admin/register', data);
};

export const checkDuplicateId = (ADMIN_ID) => {
  return axiosInstance.get(`/admin/check/${ADMIN_ID}`);
};