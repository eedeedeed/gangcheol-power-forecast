const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');


router.post('/register', buildingController.registerBuilding); // 건물 등록
router.get('/getbuildings/:adminId', buildingController.getBuildingsByAdminId); //건물조회


module.exports = router;
