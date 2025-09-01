// services/lagService.js
const db = require('../models');

const toNumOrNull = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/**
 * 특정 시각(ts) 기준으로 저장된 랙 컬럼을 그대로 조회
 * - 테이블: power_consumption
 * - 컬럼: POWER_KWH_LAG1 / POWER_KWH_LAG24 / POWER_KWH_LAG168
 * - 시간 컬럼명은 `TIMESTAMP` 이므로 백틱으로 감싼다.
 */
exports.getLagsForBuilding = async (buildingId, ts) => {
  const [rows] = await db.sequelize.query(
    `SELECT 
        POWER_KWH_LAG1   AS lag1,
        POWER_KWH_LAG24  AS lag24,
        POWER_KWH_LAG168 AS lag168
     FROM power_consumption
     WHERE BUILDING_ID = ? AND \`TIMESTAMP\` = ?
     LIMIT 1`,
    { replacements: [buildingId, ts] }
  );

  if (rows && rows.length) {
    const r = rows[0];
    return {
      lag1:   toNumOrNull(r.lag1),
      lag24:  toNumOrNull(r.lag24),
      lag168: toNumOrNull(r.lag168),
    };
  }

  // 폴백: 못 찾으면 0으로 (또는 null 원하면 null로 바꿔도 됨)
  return { lag1: 0, lag24: 0, lag168: 0 };
};
