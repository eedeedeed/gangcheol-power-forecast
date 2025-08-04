const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const auth = require('../middleware/authMiddleware'); // 토큰 검사 미들웨어 필요

// 회원가입 API
router.post('/register', userControllers.register);

// 로그인 API
router.post('/login', userControllers.login);
// 프로필 조회(토큰 인증 필요)
router.get('/me', auth, userControllers.getMe);

module.exports = router;