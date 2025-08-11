// controllers/predictController.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc); dayjs.extend(tz);

const { getUltraShortForecast } = require('../controllers/weatherController');
const { getBuildingStaticFeatures } = require('../services/buildingService');
const { getLagsForBuilding } = require('../services/lagService'); // DB에서 가져오고 null 허용
//const { requestPrediction } = require('../services/modelService');
//const { savePrediction } = require('../services/predictionService');

const REQUIRED_NON_LAG = [
  'hour_sin','hour_cos','weekday','is_weekend',
  'temperature','humidity','wind_speed','precipitation',
  'log_total_area','cooling_ratio','has_pv','has_ess','has_pcs','building_type_encoded'
];


exports.predict = async (req, res) => {

  try {
    const debug = String(req.query.debug || '').toLowerCase(); // 'weather' | 'payload' | ''
    const buildingId = req.admin?.buildingId || req.body?.buildingId;
    if (!buildingId) return res.status(400).json({ message: 'buildingId 필요' });

    // 1) 시간 파생 (KST)
    const nowKST = dayjs().tz('Asia/Seoul');
    const hour = nowKST.hour();
    const weekday = nowKST.day(); // 0=일
    const isWeekend = (weekday === 0 || weekday === 6) ? 1 : 0;
    const hourSin = Math.sin((2 * Math.PI * hour) / 24);
    const hourCos = Math.cos((2 * Math.PI * hour) / 24);

    // 2) 건물 정적
    const staticFeat = await getBuildingStaticFeatures(buildingId);
    if (!staticFeat) return res.status(404).json({ message: '건물 정보 없음' });
    if (staticFeat.nx == null || staticFeat.ny == null) {
      return res.status(422).json({ message: '건물에 NX/NY 미등록' });
    }

    // 3) 날씨 조회 (여기서 실제 호출)
    const weatherRaw = await getUltraShortForecast(staticFeat.nx, staticFeat.ny);
    const weather = weatherRaw?.weatherData ? weatherRaw.weatherData : weatherRaw;
    if (!weather) return res.status(500).json({ message: '날씨 데이터 조회 실패' });

    // 🔎 Postman에서 날씨만 확인하고 싶으면:
    if (debug === 'weather') {
      return res.status(200).json({
        buildingId,
        grid: { nx: staticFeat.nx, ny: staticFeat.ny },
        ts: nowKST.format('YYYY-MM-DD HH:mm:ss'),
        weather_snapshot: {
          fcstTime: weather.fcstTime ?? null,
          T1H: weather.T1H, REH: weather.REH, WSD: weather.WSD, RN1: weather.RN1, PTY: weather.PTY,
        }
      });
    }

    const toNum = (v) => (v == null || isNaN(Number(v))) ? 0 : Number(v);
    const toNumOrNull = (v) => (v == null || isNaN(Number(v))) ? null : Number(v);

    // 4) DB lag (null이면 그대로 null)
    const l = await getLagsForBuilding(buildingId); // { lag1, lag24, lag168 } (전부 null일 수 있음)
    const lag1   = toNumOrNull(l.lag1);
    const lag24  = toNumOrNull(l.lag24);
    const lag168 = toNumOrNull(l.lag168);

    // 5) 페이로드 구성 (학습 피처와 1:1)
    const payload = {
      hour_sin: hourSin, hour_cos: hourCos, weekday, is_weekend: isWeekend,
      temperature: toNum(weather.T1H), humidity: toNum(weather.REH),
      wind_speed: toNum(weather.WSD), precipitation: toNum(weather.RN1),
      log_total_area: toNum(staticFeat.log_total_area), cooling_ratio: toNum(staticFeat.cooling_ratio),
      has_pv: Number(!!staticFeat.has_pv), has_ess: Number(!!staticFeat.has_ess),
      has_pcs: Number(!!staticFeat.has_pcs), building_type_encoded: toNum(staticFeat.building_type_encoded),
      power_consumption_lag1: lag1, power_consumption_lag24: lag24, power_consumption_lag168: lag168,
    };

    // 🔎 Postman에서 페이로드만 확인하고 싶으면:
    if (debug === 'payload') {
      const missing = REQUIRED_NON_LAG.filter(k => !(k in payload));
      return res.status(200).json({
        buildingId,
        ts: nowKST.format('YYYY-MM-DD HH:mm:ss'),
        fcstTime: weather.fcstTime ?? null,
        missing_non_lag: missing, // 보통 []
        payload
      });
    }

    // 6) 최소 검증(비-lag만)
    const missing = REQUIRED_NON_LAG.filter(k => !(k in payload));
    if (missing.length) return res.status(400).json({ message: `누락 피처: ${missing.join(', ')}` });

    // // 7) 모델 호출 (lag는 null → Flask에서 np.nan으로 변환)
    // const { prediction, model_version } = await requestPrediction(payload);

    // // 8) 저장
    // await savePrediction({
    //   buildingId,
    //   predictAt: nowKST.toDate(),
    //   predKwh: prediction,
    //   modelVersion: model_version,
    //   context: {
    //     fcstTime: weather.fcstTime ?? null,
    //     lag_available: { lag1: lag1 !== null, lag24: lag24 !== null, lag168: lag168 !== null }
    //   }
    // });

    // 9) 응답
    return res.status(200).json({
      buildingId,
      ts: nowKST.format('YYYY-MM-DD HH:mm:ss'),
      fcstTime: weather.fcstTime ?? null,
      prediction_kwh: Math.round(prediction * 100) / 100,
      model_version
    });
  } catch (e) {
    console.error('[predict] error:', e);
    return res.status(500).json({ message: '예측 실패', error: e.message });
  }
};
