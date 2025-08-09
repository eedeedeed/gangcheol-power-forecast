import axios from 'axios';
const API_BASE_URL = 'http://192.168.111.211:5000'; // 실제 백엔드 주소로 수정

export const login = (ADMIN_ID, ADMIN_PASSWORD) => {
  return axios.post(`${API_BASE_URL}/admin/login`, { ADMIN_ID, ADMIN_PASSWORD });
};

export const register = (data) => {
  return axios.post(`${API_BASE_URL}/admin/register`, data);
};

export const checkDuplicateId = (ADMIN_ID) => {
  return axios.get(`${API_BASE_URL}/admin/check/${ADMIN_ID}`);
};


export const buildingRegister = (data) => {
  return axios.post(`${API_BASE_URL}/building/register`, data);
}

