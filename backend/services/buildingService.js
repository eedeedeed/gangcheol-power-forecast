// services/buildingService.js
const { BuildingInfo } = require('../models');
const { encodeBuildingType } = require('../utils/featureEncoders');

exports.getBuildingStaticFeatures = async (buildingId) => {
  const b = await BuildingInfo.findByPk(buildingId);
  if (!b) return null;

  // 네가 전처리에서 만든 파생을 백엔드에서도 동일하게 맞춘다
  const total = Number(b.TOTAL_AREA || 0);
  const cooling = Number(b.COOLING_AREA || 0);
  const cooling_ratio = total > 0 ? (cooling / total) : 0;
  const log_total_area = total > 0 ? Math.log(total) : 0;

  const has_pv  = Number((b.PV_CAPACITY  || 0) > 0);
  const has_ess = Number((b.ESS_CAPACITY || 0) > 0);
  const has_pcs = Number((b.PCS_CAPACITY || 0) > 0);

  const building_type_encoded = encodeBuildingType(b.BUILDING_TYPE); // 학습 시 맵과 동일해야 함!

  // 날씨용 격자 좌표 (nx, ny)도 building_info에 저장해뒀다고 가정
  return {
    log_total_area, cooling_ratio, has_pv, has_ess, has_pcs, building_type_encoded,
    nx: b.NX, ny: b.NY
  };
};
