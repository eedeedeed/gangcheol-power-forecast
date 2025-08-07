const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 컨트롤러 함수로 위임
router.get('/geocode', locationController.getGeocode);

module.exports = router;
