// 단기예보 api 요청 등
require('dotenv').config();
const axios = require('axios');
const dayjs = require('dayjs');
const { getBaseTimeFromNow, getRoundedFcstTime } = require('../config/weatherUnits');
const { ptyMap, formatRainfall } = require('../config/weather_code_mapping');
const { convertToGrid } = require('../config/geoUtil');
const {geocodeToAddress} = require('../config/geocoding')

// 초단기예보 가져오기
const toNumOrNull = (v) => {
  if (v === undefined || v === null) return null;
  if (v === '-' || v === '강수없음') return 0;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

exports.getUltraShortForecast = async (nx, ny) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;

    // 1) 기준 시각/타겟 시각
    const base_date = dayjs().format('YYYYMMDD');
    const base_time = getBaseTimeFromNow();     // 예: 현재-40분 로직 반영돼 있다고 가정
    const fcstTimeTarget = getRoundedFcstTime(); // 예: HH00/HH30 타겟

    // 2) 호출 (nx/ny 숫자형 + 넉넉한 개수)
    const { data } = await axios.get(
      'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
      {
        params: {
          serviceKey: API_KEY,
          base_date,
          base_time,
          nx: Number(nx),
          ny: Number(ny),
          pageNo: 1,
          numOfRows: 1000,
          dataType: 'JSON',
        },
        timeout: 10000,
      }
    );

    const items = data?.response?.body?.items?.item || [];
    if (!items.length) throw new Error('예보 데이터가 없습니다.');

    // 3) 같은 날짜 먼저 탐색
    const sameDate = items.filter(it => it.fcstDate === base_date);
    const timesOnDate = [...new Set(sameDate.map(it => it.fcstTime))].sort();

    // 4) 사용할 시각 결정 (타겟 → 같은 날짜 최신 → 전체 최신)
    let useDate = base_date;
    let useTime = null;

    if (timesOnDate.includes(fcstTimeTarget)) {
      useTime = fcstTimeTarget;
    } else if (timesOnDate.length) {
      useTime = timesOnDate[timesOnDate.length - 1];
    } else {
      // 같은 날짜에 데이터가 없다면 전체에서 최신 fcstDate/Time 찾기
      const dates = [...new Set(items.map(it => it.fcstDate))].sort();
      useDate = dates[dates.length - 1]; // 가장 최근 날짜
      const times = [...new Set(items.filter(it => it.fcstDate === useDate).map(it => it.fcstTime))].sort();
      useTime = times[times.length - 1] || null;
    }

    // 디버그 로그
    console.log('[DEBUG] base_date:', base_date, 'base_time:', base_time, 'target:', fcstTimeTarget);
    console.log('[DEBUG] available on base_date:', timesOnDate, '→ using:', useDate, useTime);

    if (!useTime) {
      return {
        fcstTime: null,
        T1H: null, REH: null, WSD: null, RN1: null, PTY: null,
        '강수형태': '알 수 없음', '강수량': null, '기온': null, '습도': null, '풍속': null,
      };
    }

    // 5) 선택한 시각 데이터만 추출
    const at = items.filter(it => it.fcstDate === useDate && it.fcstTime === useTime);

    // 6) 카테고리별 매핑
    const pick = (cat) => at.find(it => it.category === cat)?.fcstValue ?? null;

    const raw = {
      T1H: toNumOrNull(pick('T1H')),
      REH: toNumOrNull(pick('REH')),
      WSD: toNumOrNull(pick('WSD')),
      RN1: toNumOrNull(pick('RN1')),
      PTY: (pick('PTY') == null) ? null : String(pick('PTY')),
    };

    const pretty = {
      '강수형태': (raw.PTY != null && ptyMap[raw.PTY]) ? ptyMap[raw.PTY] : '알 수 없음',
      '강수량': formatRainfall(raw.RN1),
      '기온': raw.T1H != null ? `${raw.T1H}℃` : null,
      '습도': raw.REH != null ? `${raw.REH}%` : null,
      '풍속': raw.WSD != null ? `${raw.WSD} m/s` : null,
    };

    return {
      fcstTime: useTime,     // predict 쪽에서 쓰는 키 유지
      ...raw,                // T1H, REH, WSD, RN1, PTY
      ...pretty,             // 기온, 습도, 풍속, 강수형태, 강수량
    };
  } catch (err) {
    console.error('❌ 날씨 예보 조회 실패:', err.message);
    throw err;
  }
};

// 현재 기상 데이터 조회

// 실황 전용 base 시간: HH00 (분<40 → 한시간 전 HH00)
function getNcstBase() {
  const now = dayjs().tz('Asia/Seoul');
  const base = now.minute() < 40 ? now.subtract(1, 'hour') : now;
  return {
    base_date: base.format('YYYYMMDD'),
    base_time: base.format('HH00'),
  };
}

// 관측 기반 현재 날씨 조회 (초단기실황)
// 현재 기상 데이터 조회 (초단기실황)
exports.getCurrentWeather = async (nx, ny) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;

    // 1) 기본 base
    let { base_date, base_time } = getNcstBase();

    const callNcst = async (bd, bt) => {
      const resp = await axios.get(
        'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
        {
          params: {
            serviceKey: API_KEY,
            base_date: bd,
            base_time: bt,   // ← HH00
            nx, ny,
            pageNo: 1,
            numOfRows: 1000,
            dataType: 'JSON',
          },
        }
      );
      return resp.data;
    };

    // 2) 1차 호출
    let data = await callNcst(base_date, base_time);
    let items = data?.response?.body?.items?.item;

    // 3) 비어있으면 한 시간 더 이전으로 폴백
    if (!items || items.length === 0) {
      const prev = dayjs(`${base_date}${base_time}`, 'YYYYMMDDHHmm')
        .tz('Asia/Seoul')
        .subtract(1, 'hour');
      base_date = prev.format('YYYYMMDD');
      base_time = prev.format('HH00');

      data = await callNcst(base_date, base_time);
      items = data?.response?.body?.items?.item;
    }

    // 4) 그래도 없으면 헤더 찍고 에러
    if (!items || items.length === 0) {
      const header = data?.response?.header;
      console.error('[Ncst header]', header);
      throw new Error('실황 데이터가 없습니다.');
    }

    // 필요한 항목만
    const filtered = items.filter(v => ['T1H','RN1','PTY','WSD','REH'].includes(v.category));

    const raw = { T1H: null, REH: null, WSD: null, RN1: null, PTY: null };
    for (const { category, obsrValue } of filtered) raw[category] = obsrValue;

    const pretty = {
      기온: raw.T1H != null ? `${raw.T1H}℃` : null,
      습도: raw.REH != null ? `${raw.REH}%` : null,
      풍속: raw.WSD != null ? `${raw.WSD} m/s` : null,
      강수형태: ptyMap[raw.PTY] ?? '알 수 없음',
      강수량: formatRainfall(raw.RN1),
    };

    console.log('[DEBUG][실황] base_date:', base_date, 'base_time:', base_time);

    return { obsTime: `${base_date} ${base_time}`, ...raw, ...pretty };

  } catch (err) {
    console.error('❌ 현재 실황 날씨 조회 실패:', err.message);
    // 응답 에러일 때 원인 확인용 로그
    if (err.response?.data) {
      console.error('[KMA ERROR]', err.response.data?.response?.header);
    }
    throw err;
  }
};

// 📌 프론트 요청 → 위도/경도 받아서 현재 날씨 반환
exports.getCurrentWeatherByLatLon = async (req, res) => {
  console.log('현재위치 기반 날씨 조회 함수호출O');
  
  try {
    // 쿼리만 출력
    console.log('query:', req.query);
    
    const latRaw = req.query?.lat;
    const lonRaw = req.query?.lng ?? req.query?.lon ?? req.query?.long; // 모두 지원
    console.log('[Q] raw lat/lon =', latRaw, lonRaw);

    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    console.log('[Q] parsed lat/lon =', lat, lon, 'finite?', Number.isFinite(lat), Number.isFinite(lon));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ message: 'lat, lng(lon) 값을 올바르게 입력해주세요.', query: req.query });
    }

    const { nx, ny } = convertToGrid(lat, lon);
    console.log('날씨격자로 변경 완료');
    
    // ⬇️ 날씨와 주소를 병렬 조회
    const [weatherData, addressData] = await Promise.all([
      exports.getCurrentWeather(nx, ny),
      (async () => {
        try {
          return await geocodeToAddress(lon, lat);
        } catch (e) {
          console.warn('역지오코딩 실패:', e.message);
          return null; // 주소 조회 실패해도 날씨는 반환
        }
      })(),
    ]);

    console.log('[OK] weather done. address done?', !!addressData);
    console.log(addressData);
    const address = addressData
    console.log(weatherData);
    

return res.status(200).json({
  timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  location: { lat, lon, nx, ny, crs: 'EPSG:4326' },
  address: address,
  weather: weatherData,
});
    

  } catch (err) {
    console.error('현재 날씨 조회 실패:', err);
    return res.status(500).json({ message: '현재 날씨 조회 실패', error: err.message });
  }
};