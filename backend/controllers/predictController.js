const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc); dayjs.extend(tz);

const { getUltraShortForecast } = require('../controllers/weatherController'); // 초단기날씨예측
const { getBuildingStaticFeatures } = require('../services/buildingService');
const { getLagsForBuilding } = require('../services/lagService');            
const { requestPrediction } = require('../services/modelService');
const { savePrediction } = require('../services/predictionService');

const REQUIRED_NON_LAG = [
  'hour_sin','hour_cos','weekday','is_weekend',
  'temperature','humidity','wind_speed','precipitation',
  'log_total_area','cooling_ratio','has_pv','has_ess','has_pcs','building_type_encoded'
];

//건물 전력예측
exports.predictForMyBuilding = async (req, res) => {
  try {
    const buildingId = req.admin?.buildingId || req.body?.buildingId; // 토큰 없으면 body fallback
    if (!buildingId) return res.status(400).json({ message: 'buildingId 필요' });

    // 1) 시간 파생 (KST)
    const nowKST = dayjs().tz('Asia/Seoul');
    const hour = nowKST.hour();
    const weekday = nowKST.day(); // 0=일
    const isWeekend = (weekday === 0 || weekday === 6) ? 1 : 0;
    const hourSin = Math.sin((2 * Math.PI * hour) / 24);
    const hourCos = Math.cos((2 * Math.PI * hour) / 24);
    console.log('[predict] 시간 파생 OK');

    // 2) 건물 정적 피처
    const staticFeat = await getBuildingStaticFeatures(buildingId);
    if (!staticFeat) return res.status(404).json({ message: '건물 정보 없음' });
    console.log('[predict] 정적 피처 OK', staticFeat);

    // 3) 날씨 (nx, ny 필요)
    const weatherRaw = await getUltraShortForecast(staticFeat.nx, staticFeat.ny);
    // weatherController 반환 형태가 { weatherData: {...} } 인 경우 대응
    const weather = weatherRaw?.weatherData ? weatherRaw.weatherData : weatherRaw;
    if (!weather) return res.status(500).json({ message: '날씨 데이터 조회 실패' });
    console.log('[predict] 날씨 OK', weather);

    const toNum = (v) => (v == null || isNaN(Number(v))) ? 0 : Number(v);
    const toNumOrNull = (v) => (v == null || Number.isNaN(Number(v))) ? null : Number(v);

    // 4) DB lag (없어도 진행: null 허용)
    const l = await getLagsForBuilding(buildingId); // { ok, lag1, lag24, lag168 } 또는 { ok:false, ... }
    const lag1   = (l && l.ok) ? toNumOrNull(l.lag1)   : null;
    const lag24  = (l && l.ok) ? toNumOrNull(l.lag24)  : null;
    const lag168 = (l && l.ok) ? toNumOrNull(l.lag168) : null;

    // 5) 페이로드 (학습 피처와 1:1)
    const payload = {
      // 시간
      hour_sin: hourSin,
      hour_cos: hourCos,
      weekday,
      is_weekend: isWeekend,

      // 날씨 (필드명 주의: 학습 명칭과 동일)
      temperature: toNum(weather.T1H),
      humidity: toNum(weather.REH),
      wind_speed: toNum(weather.WSD),
      precipitation: toNum(weather.RN1),

      // 정적
      log_total_area: toNum(staticFeat.log_total_area),
      cooling_ratio: toNum(staticFeat.cooling_ratio),
      has_pv: Number(!!staticFeat.has_pv),
      has_ess: Number(!!staticFeat.has_ess),
      has_pcs: Number(!!staticFeat.has_pcs),
      building_type_encoded: toNum(staticFeat.building_type_encoded),

      // lag — null 허용 (Flask에서 np.nan 처리)
      power_consumption_lag1: lag1,
      power_consumption_lag24: lag24,
      power_consumption_lag168: lag168,
    };

    // 6) 필수(비-lag) 피처 검증
    const missing = REQUIRED_NON_LAG.filter(k => !(k in payload));
    if (missing.length) {
      return res.status(400).json({ message: `누락 피처: ${missing.join(', ')}` });
    }

    // 7) 모델 호출
    const { prediction, model_version } = await requestPrediction(payload);

    // 8) 저장
    await savePrediction({
      buildingId,
      predictAt: nowKST.toDate(),
      predKwh: prediction,
      modelVersion: model_version,
      context: {
        fcstTime: weather.fcstTime ?? null,
        lag_available: {
          lag1:   lag1   !== null,
          lag24:  lag24  !== null,
          lag168: lag168 !== null,
        }
      }
    });

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