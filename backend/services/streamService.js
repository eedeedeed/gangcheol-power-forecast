// buildingId -> Set(res)
const subscribers = new Map();

function addSubscriber(buildingId, res, remove = false) {
  if (!subscribers.has(buildingId)) subscribers.set(buildingId, new Set());
  const set = subscribers.get(buildingId);
  remove ? set.delete(res) : set.add(res);
}

function broadcast(buildingId, payload) {
  const set = subscribers.get(buildingId);
  if (!set) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) res.write(data);
}

module.exports = { addSubscriber, broadcast };
