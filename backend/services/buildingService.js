// services/buildingService.js
const { BuildingInfo } = require('../models');
const { encodeBuildingType } = require('../utils/featureEncoders');

exports.getBuildingStaticFeatures = async (buildingId) => {
  const b = await BuildingInfo.findByPk(buildingId, {
    attributes: [
      'building_type',
      'total_area', 'cooling_area',
      'pv_capacity', 'ess_capacity', 'pcs_capacity',
      'has_pv', 'has_ess', 'has_pcs',
      'nx', 'ny'
    ],
    raw: true,
  });
  if (!b) return null;

  // 전처리 동일 적용
  const total = Number(b.total_area || 0);
  const log_total_area = total > 0 ? Math.log(total) : 0;

  // cooling_ratio 는 DB 생성컬럼이라 모델로도 읽을 수 있지만, attributes에 안 뽑았으니 계산식으로 통일
  const cooling = Number(b.cooling_area || 0);
  const cooling_ratio = (total > 0 && cooling >= 0 && cooling <= total) ? (cooling / total) : 0;

  // has_* 는 DB 생성칼럼이 있으니 우선 DB값, 없으면 용량으로 보정
  const has_pv  = (b.has_pv  != null) ? Number(!!b.has_pv)  : Number((b.pv_capacity  || 0) > 0);
  const has_ess = (b.has_ess != null) ? Number(!!b.has_ess) : Number((b.ess_capacity || 0) > 0);
  const has_pcs = (b.has_pcs != null) ? Number(!!b.has_pcs) : Number((b.pcs_capacity || 0) > 0);

  const building_type_encoded = encodeBuildingType(b.building_type);

  // 격자 좌표
  const nx = (b.nx == null) ? null : Number(b.nx);
  const ny = (b.ny == null) ? null : Number(b.ny);

  return {
    log_total_area, cooling_ratio,
    has_pv, has_ess, has_pcs,
    building_type_encoded,
    nx, ny,
  };
};
