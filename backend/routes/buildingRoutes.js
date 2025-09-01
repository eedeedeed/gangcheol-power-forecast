const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

router.post('/register', buildingController.registerBuilding); // 건물 등록
router.get('/getbuildings/:adminId', buildingController.getBuildingsByAdminId); //건물조회
router.delete('/delete/:buildingId', buildingController.deleteBuilding); //건물삭제
router.put('/updateBuildings/:buildingId', buildingController.updateBuilding); // 건물 수정

module.exports = router;
