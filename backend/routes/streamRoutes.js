//SSE 스트림만 정의

const express = require('express');
const { streamConsumption } = require('../controllers/streamController');

const router = express.Router();
router.get('/consumption', streamConsumption);

// ✅ CommonJS export
module.exports = router;
