import axios from 'axios';

// 다른 파일에서 이 주소를 사용할 수 있도록 export합니다.
export const API_BASE_URL = 'http://192.168.111.212:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default axiosInstance;