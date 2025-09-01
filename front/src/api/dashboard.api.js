import axiosInstance from './axiosInstance';

export const getDashboardData = (buildingId) => {
  return axiosInstance.get(`/dashboard/${buildingId}`);
};

export const getCurrentWeather = (location) => {
  // location 객체에 lat, lng가 있을 경우 쿼리 파라미터로 전송
  if (location && location.lat && location.lng) {
    console.log('위경도' , location.lat, location.lng);
    
    return axiosInstance.get('/weather/current', {
      params: {
        lat: location.lat,
        lng: location.lng,
      },
    });
  }
  // location 정보가 없으면 기존처럼 건물 기반으로 요청 (buildingId 필요)
  // 이 부분은 기존 로직에 따라 달라질 수 있으므로, 우선 위치 기반 요청에 집중합니다.
  // 만약 위치 정보가 필수라면, 에러를 발생시키는 것이 더 나을 수 있습니다.
  return axiosInstance.get('/weather/current');
};

