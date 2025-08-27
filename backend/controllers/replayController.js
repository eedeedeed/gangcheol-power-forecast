// controllers/replayController.js
const { ensurePeakThreshold } = require('../services/thresholdService');
const { startReplayTimer, stopReplayTimer } = require('../services/replayService');

function parseBuildingId(req) {
  // POST(body) 우선, 없으면 query 사용
  const raw = req.body?.buildingId ?? req.query?.buildingId;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

async function startReplay(req, res) {
  const buildingId = parseBuildingId(req);
  const speed = Number(req.body?.speed ?? req.query?.speed ?? 5);

  if (!buildingId) {
    return res.status(400).json({ ok: false, message: 'buildingId가 필요합니다.' });
  }
  if (!(speed > 0)) {
    return res.status(400).json({ ok: false, message: 'speed는 0보다 커야 합니다.' });
  }

  await ensurePeakThreshold(buildingId);
  startReplayTimer(buildingId, speed);
  res.json({ ok: true, buildingId, speed });
}

function stopReplay(req, res) {
  const buildingId = parseBuildingId(req);
  if (!buildingId) {
    return res.status(400).json({ ok: false, message: 'buildingId가 필요합니다.' });
  }
  stopReplayTimer(buildingId);
  res.json({ ok: true, buildingId });
}

module.exports = { startReplay, stopReplay };
