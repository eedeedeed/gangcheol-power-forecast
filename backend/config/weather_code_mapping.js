//강수형태 PTY
const ptyMap = {
  '0': '없음',
  '1': '비',
  '2': '비/눈',
  '3': '눈',
  '5': '빗방울',
  '6': '빗방울눈날림',
  '7': '눈날림'
};

//강수량 RN1
function formatRainfall(value) {
  const val = parseFloat(value);

  if (isNaN(val)) return value; // "강수없음" 같은 경우

  if (val < 1.0) return '1mm 미만';
  if (val >= 1.0 && val < 30.0) return `${val}mm`;
  if (val >= 30.0 && val < 50.0) return '30.0~50.0mm';
  return '50.0mm 이상';
}

module.exports = { ptyMap,formatRainfall };