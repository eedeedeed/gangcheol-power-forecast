const express = require('express');
const router = express.Router();
const { getCurrentWeatherByLatLon } = require('../controllers/weatherController');

router.get('/current', getCurrentWeatherByLatLon); //현재날씨조회

module.exports = router;
