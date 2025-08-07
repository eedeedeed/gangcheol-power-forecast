// controllers/locationController.js
const { Location } = require('../models');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const apiKey = 'CFE0BF16-1308-3D7B-A1EA-9AA4AC4FD66D';

exports.getGeocode = async (req, res) => {
  const address = req.query.address;

  if (!address) {
    return res.status(400).json({ error: 'address query parameter is required' });
  }

  const url = `https://api.vworld.kr/req/address?service=address&request=getCoord&format=json&type=road&address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const point = data?.response?.result?.point;
    if (!point) {
      return res.status(404).json({ error: '좌표 정보를 찾을 수 없습니다.' });
    }

    console.log(`📍 주소: ${address}`);
    console.log(`🧭 위도: ${point.y}`);
    console.log(`🧭 경도: ${point.x}`);

    // API 호출 결과를 클라이언트에 반환
    res.json({
      address,
      latitude: point.y,
      longitude: point.x,
    });

  } catch (error) {
    console.error('API 요청 실패:', error);
    res.status(500).json({ error: 'API 요청 실패' });
  }
};
