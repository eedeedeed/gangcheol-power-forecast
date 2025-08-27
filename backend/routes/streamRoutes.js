// routes/streamRoutes.js
const router = require('express').Router();
const { runReplayOnce, resetReplayPointer } = require('../services/replayService');

router.get('/replay', async (req, res) => {
  const buildingId = Number(req.query.buildingId);
  if (!buildingId) return res.status(400).end('buildingId required');

  // (옵션) 처음 시작 TS를 지정하고 싶다면 ?ts=YYYY-MM-DD HH:mm:ss 로 넘겨서 초기화
  const tsParam = req.query.ts;

  // SSE 헤더
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log(`[SSE] replay opened buildingId=${buildingId}`);

  // 시작 TS 명시 시 포인터 세팅
  if (tsParam) {
    try { await resetReplayPointer(buildingId, tsParam); }
    catch (e) {
      console.error('[SSE replay] reset error:', e.message);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`);
      return res.end();
    }
  }

  const INTERVAL = 1000; // 1초마다 1틱
  let stopped = false;

  const stop = () => {
    if (!stopped) {
      stopped = true;
      res.end();
      console.log(`[SSE] replay closed buildingId=${buildingId}`);
    }
  };
  req.on('close', stop);

  const loop = async () => {
    if (stopped) return;
    try {
      const payload = await runReplayOnce(buildingId);
      if (payload) {
        res.write(`event: replay_tick\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        if (payload.done) {
          res.write(`event: end\n`);
          res.write(`data: {}\n\n`);
          return stop();
        }
      } else {
        res.write(`event: end\n`);
        res.write(`data: {}\n\n`);
        return stop();
      }
    } catch (e) {
      console.error('[SSE replay] error:', e);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`);
      return stop();
    }
    if (!stopped) setTimeout(loop, INTERVAL);
  };

  loop();
});

module.exports = router;
