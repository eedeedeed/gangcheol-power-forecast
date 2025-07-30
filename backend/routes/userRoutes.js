const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

// 회원가입 API
router.post('/register', userControllers.register);

// 로그인 API
router.post('/login', userControllers.login);

module.exports = router;