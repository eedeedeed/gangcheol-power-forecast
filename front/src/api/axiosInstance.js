import axios from 'axios';

const API_BASE_URL = 'http://192.168.111.246:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default axiosInstance;