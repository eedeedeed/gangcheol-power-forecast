// 주소 -> 위,경도

const axios = require('axios');
require('dotenv').config();

async function addressToGeocode(address) {
  const API_KEY = process.env.GEOCODE_API_KEY;
  const url = `https://api.vworld.kr/req/address?service=address&request=getCoord&format=json&type=road&address=${encodeURIComponent(address)}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const point = response.data?.response?.result?.point;

    if (!point) throw new Error('좌표 정보를 찾을 수 없습니다.');

    return {
      lat: point.y, // 위도
      lon: point.x, // 경도
    };
  } catch (err) {
    console.error('❌ 주소 → 좌표 변환 실패:', err.message);
    throw err;
  }
}

module.exports = { addressToGeocode };
