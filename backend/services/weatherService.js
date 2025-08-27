// services/weatherService.js
const db = require('../models');

/**
 * 과거 시각(ts)과 building_id로 날씨를 조회해 모델 feature로 반환
 * 반환 포맷: { temperature, humidity, wind_speed, precipitation }
 */
exports.getWeatherAt = async (buildingId, ts) => {
  // 너 DB 스키마에 맞게 컬럼명/테이블명만 맞춰주면 됨
  const [rows] = await db.sequelize.query(
    `SELECT
        TEMPERATURE   AS temperature,
        HUMIDITY      AS humidity,
        WIND_SPEED    AS wind_speed,
        PRECIPITATION AS precipitation
     FROM sim_replay_data
     WHERE BUILDING_ID = ? AND TS = ?
     LIMIT 1`,
    { replacements: [buildingId, ts] }
  );

  const r = rows?.[0];
  if (!r) return null;

  const toNum = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  return {
    temperature: toNum(r.temperature),
    humidity: toNum(r.humidity),
    wind_speed: toNum(r.wind_speed),
    precipitation: toNum(r.precipitation),
  };
};
