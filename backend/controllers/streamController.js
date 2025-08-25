const { addSubscriber } = require('../services/streamService');

function streamConsumption(req, res) {
  const buildingId = Number(req.query.buildingId || 74);
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

// ✅ CommonJS export
module.exports = { streamConsumption };
