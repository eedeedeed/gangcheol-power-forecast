// services/replayService.js
const dayjs = require('dayjs');
const db = require('../models');

const { getWeatherAt } = require('./weatherService');
const { getBuildingStaticFeatures } = require('./buildingService');
const { getLagsForBuilding } = require('./lagService');
const { requestPrediction } = require('./modelService');

// 🔸 건물별 현재 재생 시각(메모리)
// 서버 재시작하면 초기화됨 (요구사항: 추가 테이블/파일 없이!)
const pointers = new Map();

// 최소 TS 가져오기
async function getMinTs(buildingId) {
  const [rows] = await db.sequelize.query(
    `SELECT MIN(TS) AS ts
       FROM sim_replay_data
      WHERE BUILDING_ID = ?`,
    { replacements: [buildingId] }
  );
  const ts = rows?.[0]?.ts;
  if (!ts) throw new Error(`replay 시작 TS 없음 (buildingId=${buildingId})`);
  return dayjs(ts).format('YYYY-MM-DD HH:mm:ss');
}

// 현재 포인터 확보 (없으면 MIN(TS)로 초기화)
async function ensurePointer(buildingId) {
  if (!pointers.has(buildingId)) {
    const ts0 = await getMinTs(buildingId);
    pointers.set(buildingId, ts0);
  }
  return pointers.get(buildingId);
}

// currentTs 이후의 다음 TS
async function findNextTs(buildingId, currentTs) {
  const [rows] = await db.sequelize.query(
    `SELECT TS
       FROM sim_replay_data
      WHERE BUILDING_ID = ?
        AND TS > ?
      ORDER BY TS ASC
      LIMIT 1`,
    { replacements: [buildingId, currentTs] }
  );
  const next = rows?.[0]?.TS || rows?.[0]?.ts || null;
  return next ? dayjs(next).format('YYYY-MM-DD HH:mm:ss') : null;
}

/**
 * 외부에서 포인터를 초기화/재설정하고 싶을 때 호출 (옵션)
 *  - ts 미지정 시 MIN(TS)로 리셋
 */
exports.resetReplayPointer = async (buildingId, tsInput) => {
  const ts = tsInput ? dayjs(tsInput).format('YYYY-MM-DD HH:mm:ss') : await getMinTs(buildingId);
  pointers.set(buildingId, ts);
  return ts;
};

/**
 * 리플레이 1틱 실행 (실제 + 예측)
 * - 새 테이블/파일 없이, 메모리 pointers 기준으로 진행
 * - tsInput을 주면 그 시각부터 시작(메모리 포인터도 그 시각으로 세팅)
 */
exports.runReplayOnce = async (buildingId, tsInput) => {
  // 1) 현재 TS 결정
  let currentTs;
  if (tsInput) {
    currentTs = dayjs(tsInput).format('YYYY-MM-DD HH:mm:ss');
    pointers.set(buildingId, currentTs);
  } else {
    currentTs = await ensurePointer(buildingId);
  }

  // 2) 해당 TS의 실제값 조회
  const [rows] = await db.sequelize.query(
    `SELECT TS, POWER_KWH
       FROM sim_replay_data
      WHERE BUILDING_ID = ? AND TS = ?
      LIMIT 1`,
    { replacements: [buildingId, currentTs] }
  );
  const row = rows?.[0];
  if (!row) {
    // 데이터가 없으면 스트림 종료 신호
    return { building_id: buildingId, ts: currentTs, done: true };
  }
  const actual = Number(row.POWER_KWH ?? NaN);

  // 3) 과거 시점의 정적/날씨/랙 조회
  const staticFeat = await getBuildingStaticFeatures(buildingId);
  if (!staticFeat) throw new Error(`건물 정적정보 없음 (buildingId=${buildingId})`);

  const weather = await getWeatherAt(buildingId, currentTs); // { temperature, humidity, wind_speed, precipitation }
  if (!weather) throw new Error(`과거 날씨 없음 (buildingId=${buildingId}, ts=${currentTs})`);

  const lags = await getLagsForBuilding(buildingId, currentTs); // { lag1, lag24, lag168 }  ※ lagService에서 `\`TIMESTAMP\`` 주의!

  // 4) 시간 파생
  const d = dayjs(currentTs);
  const hour = d.hour();
  const weekday = d.day(); // 0=일
  const isWeekend = (weekday === 0 || weekday === 6) ? 1 : 0;
  const hourSin = Math.sin((2 * Math.PI * hour) / 24);
  const hourCos = Math.cos((2 * Math.PI * hour) / 24);

  // 5) 모델 features(17개)
  const num = (v, def = 0) => {
    const n = Number(v);
    return Number.isNaN(n) ? def : n;
  };

  const features = {
    hour_sin: hourSin,
    hour_cos: hourCos,
    weekday,
    is_weekend: isWeekend,

    temperature: num(weather?.temperature),
    humidity: num(weather?.humidity),
    wind_speed: num(weather?.wind_speed),
    precipitation: num(weather?.precipitation),

    log_total_area: num(staticFeat?.log_total_area),
    cooling_ratio: num(staticFeat?.cooling_ratio),
    has_pv: Number(!!staticFeat?.has_pv),
    has_ess: Number(!!staticFeat?.has_ess),
    has_pcs: Number(!!staticFeat?.has_pcs),
    building_type_encoded: num(staticFeat?.building_type_encoded),

    lag1: num(lags?.lag1),
    lag24: num(lags?.lag24),
    lag168: num(lags?.lag168),
  };

  // 6) 모델 호출 (Flask /predict)
  const resp = await requestPrediction({ buildingId, ts: currentTs, features });
  const yhat = (typeof resp?.yhat === 'number') ? resp.yhat : null;
  const is_peak = (resp?.peak?.is_peak === 0 || resp?.peak?.is_peak === 1) ? resp.peak.is_peak : null;
  const prob = (typeof resp?.peak?.prob === 'number') ? resp.peak.prob : null;

  // 7) 다음 TS로 포인터 전진 (항상 +1시간)
  const nextTs = dayjs(currentTs).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
  pointers.set(buildingId, nextTs);

  // 8) 페이로드 반환
  return {
    building_id: buildingId,
    ts: currentTs,
    next_ts: nextTs,                   // 디버깅용 (프론트에서 다음 시각 확인 가능)
    actual_kwh: actual,
    predicted_kwh: yhat,
    weather_used: {
      temperature: num(weather?.temperature),
      humidity: num(weather?.humidity),
      wind_speed: num(weather?.wind_speed),
      precipitation: num(weather?.precipitation),
    },
    peak: { is_peak, prob },
    done: !nextTs,                     // 다음 시각 없으면 종료 신호
  };
};
