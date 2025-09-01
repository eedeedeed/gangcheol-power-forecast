// controllers/streamController.js
const { addSubscriber } = require('../services/streamService');

function streamConsumption(req, res) {
  const raw = req.body?.buildingId ?? req.query?.buildingId;
  const buildingId = Number(raw);

  if (!Number.isFinite(buildingId)) {
    res.status(400).end('buildingId가 필요합니다.');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  addSubscriber(buildingId, res);

  const keepalive = setInterval(() => res.write(':\n\n'), 15000);
  req.on('close', () => {
    clearInterval(keepalive);
    addSubscriber(buildingId, res, true);
  });
}

module.exports = { streamConsumption };
