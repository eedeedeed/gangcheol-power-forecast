const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

// (A) 간단 버전: body에 buildingId
router.post('/predict', /*auth,*/ predictController.predictForMyBuilding);

// (B) 권장: /predict/me (토큰에서 buildingId)
router.post('/predict/me', /*auth,*/ predictController.predictForMyBuilding);

module.exports = router;