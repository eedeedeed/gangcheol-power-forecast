const { ensurePeakThreshold } = require('../services/thresholdService');
const { startReplayTimer, stopReplayTimer } = require('../services/replayService');

async function startReplay(req, res) {
  const buildingId = Number(req.query.buildingId || 74);
  const speed = Number(req.query.speed || 5);
  await ensurePeakThreshold(buildingId);
  startReplayTimer(buildingId, speed);
  res.json({ ok: true, buildingId, speed });
}
function stopReplay(req, res) {
  const buildingId = Number(req.query.buildingId || 74);
  stopReplayTimer(buildingId);
  res.json({ ok: true, buildingId });
}

// ✅ CommonJS export
module.exports = { startReplay, stopReplay };
