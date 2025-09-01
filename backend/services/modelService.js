// services/modelService.js
const axios = require('axios');

const MODEL_API_URL = process.env.MODEL_API_URL || 'http://127.0.0.1:6000/predict';

/**
 * Flask로 예측 요청
 * @param {Object} payload - { buildingId, ts, features }
 * @returns {Object} - { yhat: number|null, is_peak: 0|1|null, prob?: number|null }
 */
exports.requestPrediction = async (payload /* { buildingId, ts, features } */) => {
  const { data } = await axios.post(MODEL_API_URL, payload, { timeout: 5000 });
  // Flask 응답: { yhat: <number>, peak: { is_peak, prob } }
  return data;
};