const dayjs = require('dayjs');

// 예보 생성 기준 시간 (30분 단위)
function getBaseTimeFromNow() {
  const now = dayjs();
  const hour = now.hour();
  const minute = now.minute();
  if (minute >= 45) return `${String(hour).padStart(2, '0')}30`;
  const prevHour = hour === 0 ? 23 : hour - 1;
  return `${String(prevHour).padStart(2, '0')}30`;
}

// 예보 시간 (가장 가까운 시점 기준)
function getRoundedFcstTime() {
  const now = dayjs();
  const hour = now.hour();
  const minute = now.minute();
  if (minute < 30) return `${String(hour).padStart(2, '0')}30`;
  return `${String((hour + 1) % 24).padStart(2, '0')}00`;
}

module.exports = { getBaseTimeFromNow, getRoundedFcstTime };
