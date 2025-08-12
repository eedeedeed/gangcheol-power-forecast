// 단기예보 api 요청 등
require('dotenv').config();
const axios = require('axios');
const dayjs = require('dayjs');
const { getBaseTimeFromNow, getRoundedFcstTime } = require('../config/weatherUnits');
const { ptyMap, formatRainfall } = require('../config/weather_code_mapping');
const { convertToGrid } = require('../config/geoUtil');

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

    // raw: 모델용 숫자/코드
    const raw = { T1H: null, REH: null, WSD: null, RN1: null, PTY: null };
    for (const { category, fcstValue } of filtered) {
      raw[category] = fcstValue; // 문자열이지만 숫자문자. RN1은 "강수없음"일 수도 있음
    }

    // pretty: 화면 표시용
    const pretty = {
      강수형태: ptyMap[raw.PTY] ?? '알 수 없음',
      강수량: formatRainfall(raw.RN1), // "1mm 미만" 등
      기온: raw.T1H != null ? `${raw.T1H}℃` : null,
      습도: raw.REH != null ? `${raw.REH}%` : null,
      풍속: raw.WSD != null ? `${raw.WSD} m/s` : null,
    };

    // 디버그
    console.log('[DEBUG] base_date(기준날짜):', base_date, 'base_time(예보발표시각):', base_time, 'fcstTimeTarget(몇시예보인지):', fcstTimeTarget);


    return {
      fcstTime: fcstTimeTarget,
      ...raw,     // T1H, REH, WSD, RN1, PTY
      ...pretty,  // 기온, 습도, 풍속, 강수형태, 강수량
    };
  } catch (err) {
    console.error('❌ 날씨 예보 조회 실패:', err.message);
    throw err;
  }
};

// 현재 기상 데이터 조회
// 관측 기반 현재 날씨 조회 (초단기실황)
exports.getCurrentWeather = async (nx, ny) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    const base_date = dayjs().format('YYYYMMDD');
    const base_time = getBaseTimeFromNow(); // 보통 10분 전 데이터까지 반영됨

    const response = await axios.get(
      'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
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
    if (!items) throw new Error('실황 데이터가 없습니다.');

    // 필요한 항목 추출
    const filtered = items.filter(item =>
      ['T1H', 'RN1', 'PTY', 'WSD', 'REH'].includes(item.category)
    );

    // raw 데이터
    const raw = { T1H: null, REH: null, WSD: null, RN1: null, PTY: null };
    for (const { category, obsrValue } of filtered) {
      raw[category] = obsrValue;
    }

    // 화면 표시용 데이터
    const pretty = {
      기온: raw.T1H != null ? `${raw.T1H}℃` : null,
      습도: raw.REH != null ? `${raw.REH}%` : null,
      풍속: raw.WSD != null ? `${raw.WSD} m/s` : null,
      강수형태: ptyMap[raw.PTY] ?? '알 수 없음',
      강수량: formatRainfall(raw.RN1),
    };

    console.log('[DEBUG][실황] base_date:', base_date, 'base_time:', base_time);

    return {
      obsTime: `${base_date} ${base_time}`,
      ...raw,
      ...pretty,
    };
  } catch (err) {
    console.error('❌ 현재 실황 날씨 조회 실패:', err.message);
    throw err;
  }
};

// 📌 프론트 요청 → 위도/경도 받아서 현재 날씨 반환
exports.getCurrentWeatherByLatLon = async (req, res) => {
  console.log('현재위치 기반 날씨 조회 함수호출O');
  
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'lat, lon 값을 올바르게 입력해주세요.' });
    }

    const { nx, ny } = convertToGrid(lat, lon);
    const weatherData = await exports.getCurrentWeather(nx, ny);

    return res.status(200).json({
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      location: { lat, lon, nx, ny },
      weather: weatherData,
    });
    console.log(weather);
    
  } catch (err) {
    return res.status(500).json({ message: '현재 날씨 조회 실패', error: err.message });
  }
};