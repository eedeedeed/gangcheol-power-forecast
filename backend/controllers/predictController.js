// controllers/predictController.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc); dayjs.extend(tz);

const { getBuildingStaticFeatures } = require('../services/buildingService');
const { getLagsForBuilding } = require('../services/lagService');
const { getWeatherAt } = require('../services/weatherService'); // ★ DB 과거날씨
const { requestPrediction } = require('../services/modelService');

const REQUIRED_NON_LAG = [
  'hour_sin','hour_cos','weekday','is_weekend',
  'temperature','humidity','wind_speed','precipitation',
  'log_total_area','cooling_ratio','has_pv','has_ess','has_pcs','building_type_encoded'
];

const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
};
const toNumOrNull = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

exports.predict = async (req, res) => {
  try {
    const buildingId = Number(req.params?.buildingId || req.body?.buildingId);
    if (!buildingId) return res.status(400).json({ ok:false, message: 'buildingId 필요' });

    // ts(optional): "YYYY-MM-DD HH:mm:ss" (없으면 현재 KST)
    const ts = req.body?.ts || dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

    // 1) 시간 파생 (KST)
    const d = dayjs.tz(ts, 'Asia/Seoul');
    const hour = d.hour();
    const weekday = d.day(); // 0=일
    const isWeekend = (weekday === 0 || weekday === 6) ? 1 : 0;
    const hourSin = Math.sin((2 * Math.PI * hour) / 24);
    const hourCos = Math.cos((2 * Math.PI * hour) / 24);

    // 2) 건물 정적
    const staticFeat = await getBuildingStaticFeatures(buildingId);
    if (!staticFeat) return res.status(404).json({ ok:false, message: '건물 정보 없음' });

    // 3) 과거 날씨(DB)
    //    weatherService는 TS 기준으로 sim_replay_data(또는 너가 지정한 테이블)에서 가져오도록 구현
    const w = await getWeatherAt(buildingId, ts); // { temperature, humidity, wind_speed, precipitation }
    if (!w) return res.status(404).json({ ok:false, message: '과거 날씨 없음', buildingId, ts });

    // 4) 랙: 해당 TS 기준
    const lags = await getLagsForBuilding(buildingId, ts); // { lag1, lag24, lag168 } or 디폴트
    const lag1   = toNumOrNull(lags?.lag1);
    const lag24  = toNumOrNull(lags?.lag24);
    const lag168 = toNumOrNull(lags?.lag168);

    // 5) Flask features(17개) 구성
    const features = {
      hour_sin: hourSin,
      hour_cos: hourCos,
      weekday,
      is_weekend: isWeekend,

      temperature: toNum(w?.temperature),
      humidity: toNum(w?.humidity),
      wind_speed: toNum(w?.wind_speed),
      precipitation: toNum(w?.precipitation),

      log_total_area: toNum(staticFeat.log_total_area),
      cooling_ratio: toNum(staticFeat.cooling_ratio),
      has_pv: Number(!!staticFeat.has_pv),
      has_ess: Number(!!staticFeat.has_ess),
      has_pcs: Number(!!staticFeat.has_pcs),
      building_type_encoded: toNum(staticFeat.building_type_encoded),

      lag1: lag1 ?? 0,
      lag24: lag24 ?? 0,
      lag168: lag168 ?? 0,
    };

    // 6) 최소 검증
    const missing = REQUIRED_NON_LAG.filter(k => !(k in features));
    if (missing.length) {
      return res.status(400).json({ ok:false, message: `누락 피처: ${missing.join(', ')}` });
    }

    // 7) Flask 호출 (payload 계약: { buildingId, ts, features })
    const modelResp = await requestPrediction({ buildingId, ts, features });
    const yhat = (typeof modelResp?.yhat === 'number') ? modelResp.yhat : null;
    const peak = modelResp?.peak ?? null;

    if (yhat == null) {
      return res.status(502).json({ ok:false, message: '모델 응답 이상', raw: modelResp });
    }

    return res.status(200).json({
      ok: true,
      building_id: buildingId,
      ts,
      yhat,
      peak,
      features_count: Object.keys(features).length
    });

  } catch (e) {
    console.error('[predict] error:', e);
    return res.status(500).json({ ok:false, message: '예측 실패', error: e.message });
  }
};
