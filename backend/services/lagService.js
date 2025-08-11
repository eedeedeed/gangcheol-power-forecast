// services/lagService.js
const { PowerConsumption } = require('../models');

exports.getLagsForBuilding = async (buildingId) => {
  const row = await PowerConsumption.findOne({
    where: { BUILDING_ID: buildingId },
    order: [['TIMESTAMP', 'DESC']],
    attributes: ['POWER_KWH_LAG1', 'POWER_KWH_LAG24', 'POWER_KWH_LAG168'],
  });

  if (!row) {
    return { lag1: null, lag24: null, lag168: null };
  }

  const c = row.get(); // Sequelize instance -> plain object
  return {
    lag1:   c.POWER_KWH_LAG1   ?? null,
    lag24:  c.POWER_KWH_LAG24  ?? null,
    lag168: c.POWER_KWH_LAG168 ?? null,
  };
};
