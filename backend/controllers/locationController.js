const { addressToGeocode } = require('../config/geocoding');
const { convertToGrid } = require('../config/geoUtil');
const { getUltraShortForecast } = require('./weatherController');

//주소기반 예보가져오기
exports.getWeatherFcst = async (address) => {
  
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: '주소가 필요합니다.' });
    console.log('[1] 요청 주소:', address);

    // 1. 주소 → 위경도
    const { lat, lon } = await addressToGeocode(address);
    console.log('[2] 위경도:', JSON.stringify({ lat, lon }));

    // 2. 위경도 → 격자 X, Y
    const { x, y } = convertToGrid(lat, lon);
    console.log('[3] 격자 좌표:', JSON.stringify({ x, y }));

    // 3. 날씨 정보 요청
    const weatherData = await getUltraShortForecast(x, y);
    console.log('[4] 날씨 데이터:', JSON.stringify(weatherData, null, 2));

    // 4. 결과 반환
    return weatherData;

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};