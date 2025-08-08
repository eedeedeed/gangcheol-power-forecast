// 단기예보 api 요청 등

require('dotenv').config();
const axios = require('axios');
const dayjs = require('dayjs');
const { getBaseTimeFromNow, getRoundedFcstTime } = require('../config/weatherUnits');
const { ptyMap, formatRainfall } = require('../config/weather_code_mapping');

// 초단기예보 가져오기
exports.getUltraShortForecast = async (nx,ny) => {
  try {
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
    if (!items) throw new Error('예보 데이터가 없습니다.');

    // 필요한 항목만 추출
    const filtered = items.filter(item =>
      item.fcstTime === fcstTimeTarget &&
      ['T1H', 'RN1', 'PTY', 'WSD', 'REH'].includes(item.category)
    );

    // 보기 좋게 매핑
    const result = {};
    for (const item of filtered) {
      const { category, fcstValue } = item;

      switch (category) {
        case 'PTY':
          result['강수형태'] = ptyMap[fcstValue] ?? '알 수 없음';
          break;
        case 'RN1':
          result['강수량'] = formatRainfall(fcstValue);
          break;
        case 'T1H':
          result['기온'] = `${fcstValue}℃`;
          break;
        case 'REH':
          result['습도'] = `${fcstValue}%`;
          break;
        case 'WSD':
          result['풍속'] = `${fcstValue} m/s`;
          break;
      }
    }

    //디버그
    console.log('[DEBUG] 기준날짜 / base_date:', base_date);
    console.log('[DEBUG] 예보발표시각 /base_time:', base_time);
    console.log('[DEBUG] fcstTimeTarget:', fcstTimeTarget, '시 예보');
    // if (items?.length) {
    //   console.log('[DEBUG] sample item:', items[0]);
    // }

    return result;

  } catch (err) {
    console.error('❌ 날씨 예보 조회 실패:', err.message);
    throw err;
  }
};