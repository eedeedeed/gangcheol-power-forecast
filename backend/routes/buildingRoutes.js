const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');


router.post('/register', buildingController.registerBuilding); // 건물 등록
router.put('/update/:id', buildingController.updateBuilding); // 건물 수정
router.post('/delete/:id', buildingController.deleteBuilding); // 건물 삭제
router.get('/list', buildingController.getBuildingList); //건물조회

module.exports = router;
