// services/predictionService.js
const { PowerPrediction } = require('../models');

exports.savePrediction = async ({ buildingId, predictAt, predKwh, modelVersion }) => {
  await PowerPrediction.create({
    BUILDING_ID: buildingId,
    TIMESTAMP: predictAt,   // (권장: 컬럼명을 PREDICT_AT로 바꾸면 여기서도 변경)
    PREDICTED_KWH: predKwh,
    // MODEL_VERSION 컬럼을 추가했다면 함께 저장
  });
};
