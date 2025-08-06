const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/register', adminController.createAdmin); //관리자등록
router.post('/login', adminController.loginAdmin); //관리자로그인
router.put('/update/:id', adminController.updateAdmin); //관리자수정 put방식!!! (:id는 그냥 변수의 의미입니다...)
router.post('/delete', adminController.deleteAdmin); //관리자 탈퇴

module.exports = router;
