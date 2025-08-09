const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');


router.post('/register', buildingController.registerBuilding); // 건물 등록

module.exports = router;
