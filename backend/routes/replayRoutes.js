//“재생 시작/정지” 같은 REST 라우트만 정의

const express = require('express');
const { startReplay, stopReplay } = require('../controllers/replayController');

const router = express.Router();
router.post('/start', startReplay);
router.post('/stop',  stopReplay);

// ✅ CommonJS export
module.exports = router;
