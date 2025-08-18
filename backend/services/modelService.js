// services/modelService.js
const axios = require('axios');

const MODEL_API_URL = process.env.MODEL_API_URL || 'http://127.0.0.1:6000';

const FEATURE_ORDER = [
  'hour_sin','hour_cos','weekday','is_weekend',
  'temperature','humidity','wind_speed','precipitation',
  'log_total_area','cooling_ratio','has_pv','has_ess','has_pcs','building_type_encoded',
  'power_consumption_lag1','power_consumption_lag24','power_consumption_lag168'
];

// null/NaN -> null, 그 외 숫자 캐스팅
function buildFlat(featureMap) {
  const flat = {};
  for (const k of FEATURE_ORDER) {
    const v = featureMap[k];
    if (v === null || v === undefined || Number.isNaN(Number(v))) {
      flat[k] = null;
    } else {
      flat[k] = Number(v);
    }
  }
  return flat;
}

const client = axios.create({
  baseURL: MODEL_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

exports.requestPrediction = async (featureMap) => {
  const flat = buildFlat(featureMap);
  const featuresArray = FEATURE_ORDER.map(k => flat[k]); // ★ 배열로 생성

  // 1차: { feature_map: {...} } (Flask 권장 포맷)
  try {
    const { data } = await client.post('/predict', { feature_map: flat });
    const prediction = Number(data.prediction ?? data.pred ?? data.answer ?? data.yhat);
    const model_version = data.model_version ?? data.version ?? null;
    if (!Number.isFinite(prediction)) throw new Error(`Invalid prediction: ${JSON.stringify(data)}`);
    return { prediction, model_version };
  } catch (err1) {
    // 2차: { features: [...] }  ★ 리스트로 재시도
    try {
      const { data } = await client.post('/predict', { features: featuresArray });
      const prediction = Number(data.prediction ?? data.pred ?? data.answer ?? data.yhat);
      const model_version = data.model_version ?? data.version ?? null;
      if (!Number.isFinite(prediction)) throw new Error(`Invalid prediction: ${JSON.stringify(data)}`);
      return { prediction, model_version };
    } catch (err2) {
      const pack = (e) =>
        `${e.response?.status || ''} ${e.response?.statusText || ''} ${JSON.stringify(e.response?.data || e.message)}`;
      throw new Error(`Model API error. primary: [${pack(err1)}], fallback: [${pack(err2)}]`);
    }
  }
};