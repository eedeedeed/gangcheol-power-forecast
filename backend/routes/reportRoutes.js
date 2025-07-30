const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {createReport, getAllReports, getReportById} = require('../controllers/reportController');

// 새 리포트 생성 API 엔드포인트
router.post(
    '/',                              // API 엔드포인트 경로
    authMiddleware,                   // 사용자 인증 확인 미들웨어    
    createReport
);                    // 리포트 생성 비즈니스 로직 실행

// 모든 리포트 조회 API 엔드포인트(ID 기준)
router.get(
    '/',                                
    authMiddleware,                       
    getAllReports
);

router.get(
    '/:id',                           // URL 파라미터로 리포트 ID 받기
    authMiddleware, 
    getReportById
);          

module.exports = router;