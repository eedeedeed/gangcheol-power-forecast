// services/buildingService.js
const { BuildingInfo } = require('../models');
const { encodeBuildingType } = require('../utils/featureEncoders');

exports.getBuildingStaticFeatures = async (buildingId) => {
  const b = await BuildingInfo.findByPk(buildingId);
  if (!b) return null;

  const total = Number(b.TOTAL_AREA || 0);
  const cooling = Number(b.COOLING_AREA || 0);

  return {
    log_total_area: total > 0 ? Math.log(total) : 0,
    cooling_ratio: total > 0 ? (cooling / total) : 0,
    has_pv:  Number((b.PV_CAPACITY  || 0) > 0),
    has_ess: Number((b.ESS_CAPACITY || 0) > 0),
    has_pcs: Number((b.PCS_CAPACITY || 0) > 0),
    building_type_encoded: encodeBuildingType(b.BUILDING_TYPE),
    nx: b.NX, ny: b.NY,  // 날씨 격자
  };
};
