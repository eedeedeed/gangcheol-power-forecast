const express = require('express');
const router = express.Router();
const { Admin } = require('../models');
const adminController = require('../controllers/adminController');

router.post('/register', adminController.createAdmin); //관리자등록
router.post('/login', adminController.loginAdmin); //관리자로그인
router.put('/update/:id', adminController.updateAdmin); //관리자수정 put방식!!! (:id는 그냥 변수의 의미입니다...)
router.post('/delete', adminController.deleteAdmin); //관리자 탈퇴

// ID 중복 확인 라우트 추가
// adminRoutes.js or adminController.js
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID 중복확인 요청 들어옴:', id);  // ✅ 확인 로그

    const admin = await Admin.findByPk(id);
    res.json({ exists: !!admin });
  } catch (error) {
    console.error('중복 확인 오류:', error);  // ✅ 여기에 에러 찍힘
    res.status(500).json({ error: '중복 확인 실패' });
  }
});



module.exports = router;
