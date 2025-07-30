const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
// JWT 인증 미들웨어를 불러옵니다. 예측 API도 인증이 필요할 수 있습니다.
const authMiddleware = require('../middleware/authMiddleware');

// 1. 전력 사용량 예측 API 엔드포인트 정의:
// HTTP POST 요청이 '/predict' 경로로 들어오면 (index.js에서 /api/predictions로 연결되므로 실제 경로는 /api/predictions/predict)
// - authMiddleware를 먼저 실행하여 사용자가 인증되었는지 확인합니다. (선택 사항: 예측에 인증이 필요 없다면 authMiddleware를 제거)
// - 인증에 성공하면 predictionController.predictPowerConsumption 함수를 실행하여 예측 로직을 처리
router.post('/predict', authMiddleware, predictionController.predictPowerConsumption);

module.exports = router;
