const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 컨트롤러 함수
router.get('/', locationController.getWeather);

module.exports = router;
