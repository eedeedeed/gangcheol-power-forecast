// services/modelService.js
const axios = require('axios');
const MODEL_API_URL = process.env.MODEL_API_URL; // e.g. http://localhost:5000/predict  모델 flask 서버 

exports.requestPrediction = async (payload) => {
  const { data } = await axios.post(MODEL_API_URL, payload, { timeout: 5000 });
  return data; // { prediction, model_version }
};
