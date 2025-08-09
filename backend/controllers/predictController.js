//예측

const axios = require('axios');
const dayjs = require('dayjs');
const { getWeatherFcst } = require('./locationController');

//건물아이디로 전력소비량 예측
exports.predictByBuildingId = async (req, res) => {
  try {
    const { building_id } = req.body; 
    if (!building_id) return res.status(400).json({ error: 'building_id 필요' });

    // 1) 건물/주소 조회
    const building = await Building.findByPk(building_id);
    if (!building) return res.status(404).json({ error: '건물 없음' });

    const address = pickAddress(building);
    if (!address) return res.status(400).json({ error: '건물 주소가 없습니다.' });

    // 2) 주소 기반 날씨 (raw+pretty 포함)
    const wx = await getWeatherFcst(address);
    // wx.T1H, wx.REH, wx.WSD, wx.RN1, wx.PTY, wx.fcstTime 사용 가능

    // 3) 정적 속성 & lag 조회
    const totalArea = num(building.TOTAL_AREA);
    const coolingArea = num(building.COOLING_AREA);
    const has_pv  = num(building.PV_CAPACITY)  > 0 ? 1 : 0;
    const has_ess = num(building.ESS_CAPACITY) > 0 ? 1 : 0;
    const has_pcs = num(building.PCS_CAPACITY) > 0 ? 1 : 0;
    const building_type_encoded = encodeBuildingType(building.BUILDING_TYPE);

    const lagRows = await PowerConsumption.findAll({
      where: { BUILDING_ID: building_id },
      order: [['TS', 'DESC']],
      limit: 169,
      attributes: ['TS', 'POWER_CONSUMPTION'],
    });
    const lag1   = getLag(lagRows, 1)   ?? 0;
    const lag24  = getLag(lagRows, 24)  ?? 0;
    const lag168 = getLag(lagRows, 168) ?? 0;

    // 4) 모델 입력 payload (학습 feature명과 1:1)
    const now = dayjs(); const hour = now.hour();
    const payload = {
      hour_sin: Math.sin((2 * Math.PI * hour) / 24),
      hour_cos: Math.cos((2 * Math.PI * hour) / 24),
      weekday: now.day(),
      is_weekend: [0, 6].includes(now.day()) ? 1 : 0,

      temperature: num(wx.T1H),
      humidity: num(wx.REH),
      wind_speed: num(wx.WSD),
      precipitation: parseRain(wx.RN1), // 문자열 케이스 변환
      sunshine: 0,           // 초단기엔 없으니 정책적으로 0 (또는 추후 추가)
      solar_radiation: 0,    // 동일

      log_total_area: totalArea > 0 ? Math.log(totalArea) : 0,
      cooling_ratio: totalArea > 0 ? coolingArea / totalArea : 0,
      has_pv, has_ess, has_pcs,
      building_type_encoded,

      power_consumption_lag1: lag1,
      power_consumption_lag24: lag24,
      power_consumption_lag168: lag168,
    };

    // 5) Flask 호출
    const flaskUrl = process.env.FLASK_PREDICT_URL || 'http://localhost:5000/predict';
    const { data: flaskRes } = await axios.post(flaskUrl, payload, { timeout: 7000 });
    const prediction = Number(flaskRes?.prediction ?? 0);

    // 6) (선택) 예측 저장 --- DB에---------------------------------------------------
    // await PowerPrediction.create({
    //   BUILDING_ID: building_id,
    //   TS: now.toDate(),
    //   PREDICTION: prediction,
    // });

    // 7) 응답
    return res.json({
      building_id,
      address,
      fcstTime: wx.fcstTime ?? null,
      prediction,
      unit: 'kWh',
    });
  } catch (err) {
    console.error('[predictByBuildingId] error:', err);
    return res.status(500).json({ error: '예측 실패', detail: err.message });
  }
};

// ----- helpers -----
function pickAddress(building) {
  // 네 DB 컬럼명에 맞춰 사용 (아래 후보들 중 실제로 있는 걸로)
  return building.ADDRESS || building.BUILDING_ADDRESS || building.ADDR || null;
}
function num(v) {
  if (v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function parseRain(rn1) {
  if (rn1 === 0) return 0;
  if (!rn1) return 0;
  const s = String(rn1);
  if (s.includes('미만')) return 0.5;
  if (s.includes('이상')) return 60;
  if (s.includes('~')) {
    const [a, b] = s.replace('mm', '').split('~').map(Number);
    return Number.isFinite(a) && Number.isFinite(b) ? (a + b) / 2 : 0;
  }
  return num(s);
}
function getLag(rows, k) {
  // rows: 최신 → 과거
  return rows[k]?.POWER_CONSUMPTION ?? null;
}
function encodeBuildingType(type) {
  // 학습 때 쓰던 인코딩 규칙과 동일해야 함!
  const map = { '공공':0, '학교':1, '백화점':2, '병원':3, '아파트':4, '호텔':5 };
  return map[type] ?? 0;
}
