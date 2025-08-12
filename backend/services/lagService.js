// services/lagService.js
const { PowerConsumption } = require('../models');

const toNumOrNull = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

exports.getLagsForBuilding = async (buildingId) => {
  // 1) 최근 레코드의 사전계산 lag 컬럼 우선 사용
  const latest = await PowerConsumption.findOne({
    where: { building_id: buildingId },           // 모델 속성명 사용
    order: [['timestamp', 'DESC']],
    attributes: ['power_kwh_lag1', 'power_kwh_lag24', 'power_kwh_lag168'],
    raw: true,
  });

  if (latest) {
    const lag1   = toNumOrNull(latest.power_kwh_lag1);
    const lag24  = toNumOrNull(latest.power_kwh_lag24);
    const lag168 = toNumOrNull(latest.power_kwh_lag168);
    // 셋 중 하나라도 채워져 있으면 그 값으로 반환
    if (lag1 !== null || lag24 !== null || lag168 !== null) {
      return { lag1, lag24, lag168 };
    }
  }

  // 2) 폴백: 최근 169개를 내려받아 인덱스로 계산 (정각 연속 데이터 가정)
  const rows = await PowerConsumption.findAll({
    where: { building_id: buildingId },
    order: [['timestamp', 'DESC']],
    attributes: ['power_kwh'],
    limit: 169,      // 1, 24, 168 확보
    raw: true,
  });

  if (!rows.length) return { lag1: null, lag24: null, lag168: null };

  const val = (i) => (rows[i] ? toNumOrNull(rows[i].power_kwh) : null);
  return {
    lag1:   val(0),     // 직전 1시간
    lag24:  val(23),    // 24시간 전
    lag168: val(167),   // 168시간 전
  };
};
