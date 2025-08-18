// controllers/predictController.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc); dayjs.extend(tz);

const { getUltraShortForecast } = require('../controllers/weatherController');
const { getBuildingStaticFeatures } = require('../services/buildingService');
const { getLagsForBuilding } = require('../services/lagService'); // DB에서 가져오고 null 허용
const { requestPrediction } = require('../services/modelService');
//const { savePrediction } = require('../services/predictionService');

const REQUIRED_NON_LAG = [
  'hour_sin','hour_cos','weekday','is_weekend',
  'temperature','humidity','wind_speed','precipitation',
  'log_total_area','cooling_ratio','has_pv','has_ess','has_pcs','building_type_encoded'
];


exports.predict = async (req, res) => {

  try {
    console.log('predict 함수 실행완료');
    
    const debug = String(req.query.debug || '').toLowerCase();
    const buildingId = req.admin?.buildingId || req.body?.buildingId || req.params?.buildingId;
    if (!buildingId) return res.status(400).json({ message: 'buildingId 필요' });

    // 1) 시간 파생 (KST)
    const nowKST = dayjs().tz('Asia/Seoul');
    const hour = nowKST.hour();
    const weekday = nowKST.day(); // 0=일
    const isWeekend = (weekday === 0 || weekday === 6) ? 1 : 0;
    const hourSin = Math.sin((2 * Math.PI * hour) / 24);
    const hourCos = Math.cos((2 * Math.PI * hour) / 24);
    console.log('1. 시간파생변수 생성완료');
    
    // 2) 건물 정적
    const staticFeat = await getBuildingStaticFeatures(buildingId);
    if (!staticFeat) return res.status(404).json({ message: '건물 정보 없음' });
    if (staticFeat.nx == null || staticFeat.ny == null) {
      console.log(staticFeat);
      
      return res.status(422).json({ message: '건물에 NX/NY 미등록' });
    }
    console.log('2. 건물정적정보 불러오기 완료');
    console.log(staticFeat);
    
    
    // 3) 날씨 조회 (여기서 실제 호출)
    const weatherRaw = await getUltraShortForecast(staticFeat.nx, staticFeat.ny);
    const weather = weatherRaw?.weatherData ? weatherRaw.weatherData : weatherRaw;
    if (!weather) return res.status(500).json({ message: '날씨 데이터 조회 실패' });
    console.log('3. 날씨조회 완료', weatherRaw);

    const toNum = (v) => (v == null || isNaN(Number(v))) ? 0 : Number(v);
    const toNumOrNull = (v) => (v == null || isNaN(Number(v))) ? null : Number(v);

    // 4) DB lag (null이면 그대로 null)
    const l = await getLagsForBuilding(buildingId); // { lag1, lag24, lag168 } (전부 null일 수 있음)
    const lag1   = toNumOrNull(l.lag1);
    const lag24  = toNumOrNull(l.lag24);
    const lag168 = toNumOrNull(l.lag168);
    console.log('4. lag 3개 가져오기 완료', lag1,lag24, lag168);
    
    // 5) 페이로드 구성 (학습 피처와 1:1)
    const featureMap = {
      hour_sin: hourSin, hour_cos: hourCos, weekday, is_weekend: isWeekend,
      temperature: toNum(weather.T1H), humidity: toNum(weather.REH),
      wind_speed: toNum(weather.WSD), precipitation: toNum(weather.RN1),
      log_total_area: toNum(staticFeat.log_total_area), cooling_ratio: toNum(staticFeat.cooling_ratio),
      has_pv: Number(!!staticFeat.has_pv), has_ess: Number(!!staticFeat.has_ess),
      has_pcs: Number(!!staticFeat.has_pcs), building_type_encoded: toNum(staticFeat.building_type_encoded),
      power_consumption_lag1: lag1, power_consumption_lag24: lag24, power_consumption_lag168: lag168,
    };
    console.log('5. featureMap 구성 완료 (피처 1:1)');


    // 6) 최소 검증(비-lag만)
    const missing = REQUIRED_NON_LAG.filter(k => !(k in featureMap));
    if (missing.length) return res.status(400).json({ message: `누락 피처: ${missing.join(', ')}` });
    console.log('6. 피처 최소 검증 완료, 모델 호출 준비까지 끝');
    

    // 7) 모델 호출 (서비스가 Flask 형식에 맞춰 전송)
    const resp = await requestPrediction(featureMap);

    // 응답 정규화
    const prediction = typeof resp === 'number' ? resp : resp?.prediction;
    const model_version = typeof resp === 'object' ? resp?.model_version ?? null : null;

    if (typeof prediction !== 'number') {
      console.error('[predict] invalid model response:', resp);
      return res.status(502).json({ message: '모델 응답이 올바르지 않습니다.' });
    }

    console.log('7. 모델 호출 완료 / 예측값:', prediction);
    return res.status(200).json({ prediction, model_version });

    } catch (e) {
      console.error('[predict] error:', e);
      return res.status(500).json({ message: '예측 실패', error: e.message });
    }
  };
