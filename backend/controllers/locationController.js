const { addressToGeocode } = require('../config/geocoding');
const { convertToGrid } = require('../config/geoutil');
const { getUltraShortForecast } = require('./weatherController');

exports.getWeather = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: '주소가 필요합니다.' });

    // 1. 주소 → 위경도
    const { lat, lon } = await addressToGeocode(address);

    // 2. 위경도 → 격자 X, Y
    const { x, y } = convertToGrid(lat, lon);

    // 3. 날씨 정보 요청
    const weatherData = await getUltraShortForecast(x, y);

    // 4. 결과 반환
    res.json(weatherData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
