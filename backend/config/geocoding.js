// 주소 -> 위,경도
const axios = require('axios');
require('dotenv').config();

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

module.exports = { addressToGeocode };