// routes/predictRoutes.js
const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

// 기존 GET → POST로 변경 (JSON body 받기 위함)
router.post('/:buildingId', predictController.predict);

module.exports = router;
