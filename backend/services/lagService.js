// services/lagService.js
const { PowerConsumption } = require('../models');
const { Op } = require('sequelize');

exports.getLagsForBuilding = async (buildingId) => {
  // 최신 시각 기준으로, lag 3개가 모두 NULL이 아닌 가장 최근 1행
  const row = await PowerConsumption.findOne({
    where: {
      BUILDING_ID: buildingId,
      POWER_KWH_LAG1:   { [Op.ne]: null },
      POWER_KWH_LAG24:  { [Op.ne]: null },
      POWER_KWH_LAG168: { [Op.ne]: null },
    },
    order: [['TIMESTAMP', 'DESC']],
    attributes: ['POWER_KWH_LAG1', 'POWER_KWH_LAG24', 'POWER_KWH_LAG168'],
  });

  if (!row) {
    return { ok: false, message: 'lag 값 부족(최소 168시간 누적 필요)' };
  }

  const toNum = (v) => (v == null || isNaN(Number(v))) ? null : Number(v);
  return {
    ok: true,
    lag1:   toNum(row.POWER_KWH_LAG1),
    lag24:  toNum(row.POWER_KWH_LAG24),
    lag168: toNum(row.POWER_KWH_LAG168),
  };
};
