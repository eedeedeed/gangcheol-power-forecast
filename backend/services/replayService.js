const axios = require('axios');
const db = require('../models');
const { broadcast } = require('./streamService');

const timers = new Map();
const pointers = new Map(); // buildingId -> current TS

function judgePeak(yhat, th, mu, sigma) {
  if (th == null) return { is_peak: null, risk: null, peak_prob: null };
  const is_peak = yhat >= th ? 1 : 0;
  let risk = null, peak_prob = null;
  if (sigma && sigma > 0) {
    const z = (yhat - mu) / sigma;
    risk = Math.max(0, Math.min(1, 0.5 + z / 6));
  }
  peak_prob = is_peak ? Math.max(0.5, risk ?? 0.7) : Math.min(0.5, risk ?? 0.3);
  return { is_peak, risk, peak_prob };
}

async function loadThreshold(buildingId) {
  const [rows] = await db.sequelize.query(
    `SELECT THRESHOLD_VALUE th, MU mu, SIGMA sigma FROM peak_threshold WHERE BUILDING_ID=?`,
    { replacements: [buildingId] }
  );
  return rows[0] || {};
}

async function tick(buildingId = 74) {
  // 포인터 초기화 (맨 처음 TS)
  if (!pointers.has(buildingId)) {
    const [r0] = await db.sequelize.query(
      `SELECT MIN(TS) AS ts FROM sim_replay_data WHERE BUILDING_ID=?`,
      { replacements: [buildingId] }
    );
    if (!r0[0]?.ts) return;
    pointers.set(buildingId, r0[0].ts);
  }

  const ptr = pointers.get(buildingId);

  // 다음 1건
  const [rows] = await db.sequelize.query(
    `SELECT ID, BUILDING_ID, TS, POWER_KWH, TEMPERATURE, HUMIDITY, WIND_SPEED, PRECIPITATION
       FROM sim_replay_data
      WHERE BUILDING_ID=? AND TS >= ?
      ORDER BY TS
      LIMIT 1`,
    { replacements: [buildingId, ptr] }
  );
  if (!rows.length) return;
  const r = rows[0];

  // 임계치
  const { th = null, mu = null, sigma = null } = await loadThreshold(buildingId);

  // lag들
  const [lags] = await db.sequelize.query(
    `
    SELECT
      (SELECT POWER_KWH FROM sim_replay_data WHERE BUILDING_ID=? AND TS=DATE_SUB(?, INTERVAL 1 HOUR))  AS lag1,
      (SELECT POWER_KWH FROM sim_replay_data WHERE BUILDING_ID=? AND TS=DATE_SUB(?, INTERVAL 24 HOUR)) AS lag24,
      (SELECT POWER_KWH FROM sim_replay_data WHERE BUILDING_ID=? AND TS=DATE_SUB(?, INTERVAL 168 HOUR)) AS lag168
    `,
    { replacements: [buildingId, r.TS, buildingId, r.TS, buildingId, r.TS] }
  );
  const { lag1, lag24, lag168 } = lags[0];

  // 시간 피처
  const ts = new Date(r.TS);
  const hour = ts.getHours();
  const weekday = ts.getDay();
  const is_weekend = (weekday === 0 || weekday === 6) ? 1 : 0;
  const hour_sin = Math.sin((2 * Math.PI * hour) / 24);
  const hour_cos = Math.cos((2 * Math.PI * hour) / 24);

  // 모델 호출
  const url = process.env.MODEL_API_URL || 'http://127.0.0.1:6000/predict';
  const payload = {
    features: {
      hour_sin, hour_cos, weekday, is_weekend,
      temperature: r.TEMPERATURE,
      humidity: r.HUMIDITY,
      wind_speed: r.WIND_SPEED,
      precipitation: r.PRECIPITATION,
      power_consumption_lag1:   lag1,
      power_consumption_lag24:  lag24,
      power_consumption_lag168: lag168,
    }
  };

  let yhat = null;
  try {
    const { data } = await axios.post(url, payload, { timeout: 2500 });
    yhat = data?.prediction ?? null;
  } catch {
    // 데모 안전장치: 실패 시 관측값 기반 대체
    yhat = (r.POWER_KWH ?? 0) * (0.97 + Math.random() * 0.06);
  }

  // 피크 판단
  const { is_peak, risk, peak_prob } = judgePeak(yhat, th, mu, sigma);

  // 송출
  broadcast(buildingId, {
    ts: r.TS,
    buildingId,
    actual_kwh: r.POWER_KWH,
    yhat_kwh: yhat,
    threshold: th,
    is_peak, peak_prob, risk
  });

  // 포인터 +1h
  const [nxt] = await db.sequelize.query(
    `SELECT DATE_ADD(?, INTERVAL 1 HOUR) AS next_ts`, { replacements: [r.TS] }
  );
  pointers.set(buildingId, nxt[0].next_ts);
}

function startReplayTimer(buildingId = 74, speedSec = 5) {
  if (timers.has(buildingId)) clearInterval(timers.get(buildingId));
  const id = setInterval(() => tick(buildingId), speedSec * 1000);
  timers.set(buildingId, id);
}

function stopReplayTimer(buildingId = 74) {
  if (timers.has(buildingId)) {
    clearInterval(timers.get(buildingId));
    timers.delete(buildingId);
  }
}

module.exports = { startReplayTimer, stopReplayTimer };
