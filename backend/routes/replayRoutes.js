// routes/replayRoutes.js
const router = require('express').Router();
const { runReplayOnce } = require('../services/replayService');

/**
 * POST /replay/:buildingId
 * body: { ts?: "YYYY-MM-DD HH:mm:ss" }
 */
router.post('/:buildingId', async (req, res) => {
  try {
    const buildingId = Number(req.params.buildingId);
    console.log(`id-${buildingId}번 건물 리플레이 호출 시작됨`);
  
    const ts = req.body?.ts; // 옵션
    const payload = await runReplayOnce(buildingId, ts);
    res.json({ ok: true, ...payload });
    
  } catch (e) {
    console.error('[replay] error:', e);
    res.status(500).json({ ok: false, message: e.message });
  }
});

module.exports = router;
