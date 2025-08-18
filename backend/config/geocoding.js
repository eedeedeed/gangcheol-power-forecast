// 주소 <-> 위,경도

const axios = require('axios');
require('dotenv').config();

// 주소 -> 좌표
async function addressToGeocode(address) {
  const API_KEY = process.env.GEOCODE_API_KEY;
  const url = 'https://api.vworld.kr/req/address';

  try {
    const response = await axios.get(url, {
      params: {
        service: 'address',
        request: 'GetCoord',
        version: '2.0',
        crs: 'EPSG:4326',
        type: 'ROAD',              // 도로명 주소 사용
        address: address,          // 인코딩은 axios가 자동 처리
        format: 'json',
        errorformat: 'json',
        key: API_KEY,
      }
    });

    const point = response.data?.response?.result?.point;

    if (!point) {
      console.error('📦 VWorld 응답 데이터:', JSON.stringify(response.data, null, 2));
      throw new Error('좌표 정보를 찾을 수 없습니다.');
    }

    return {
      lat: point.y,
      lon: point.x,
    };
  } catch (err) {
    console.error('❌ 주소 → 좌표 변환 실패:', err.message);
    throw err;
  }
}

//좌표 -> 주소
async function geocodeToAddress(lon, lat) {
  try {
    const apiKey = process.env.GEOCODE_API_KEY;
    const url = 'https://api.vworld.kr/req/address';

    const params = {
      service: 'address',
      request: 'getAddress',
      version: '2.0',
      crs: 'epsg:4326', // WGS84 좌표계
      point: `${lon},${lat}`, // 경도,위도
      format: 'json',
      type: 'both', // 도로명+지번
      zipcode: 'true',
      simple: 'false',
      key: apiKey
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data?.response?.status === 'OK') {
      return data.response.result[0].text; // 전체 주소
    } else {
      throw new Error(`주소 변환 실패: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('좌표 -> 주소 변환 오류:', err.message);
    return null;
  }
}

module.exports = { addressToGeocode, geocodeToAddress };