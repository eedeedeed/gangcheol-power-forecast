// 단기예보 api 요청 등

require('dotenv').config();
const axios = require('axios');
const dayjs = require('dayjs');
const { getBaseTimeFromNow, getRoundedFcstTime } = require('../config/weatherUnits');
const { ptyMap, formatRainfall } = require('../config/weather_code_mapping');

// 초단기예보 가져오기
exports.getUltraShortForecast = async (nx,ny) => {
  const API_KEY = process.env.WEATHER_API_KEY;
  const base_date = dayjs().format('YYYYMMDD');
  const base_time = getBaseTimeFromNow();
  const fcstTimeTarget = getRoundedFcstTime();

  const response = await axios.get(
    'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
    {
      params: {
        serviceKey: API_KEY,
        base_date,
        base_time,
        nx,
        ny,
        numOfRows: 1000,
        dataType: 'JSON',
      },
    }
  );

  const items = response.data?.response?.body?.items?.item;

  // 필요한 항목만 필터링
  const filtered = items.filter(item => item.fcstTime === fcstTimeTarget && ['T1H', 'RN1', 'PTY', 'WSD', 'REH'].includes(item.category));

  return filtered;
};