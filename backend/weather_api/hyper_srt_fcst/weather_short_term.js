require('dotenv').config(); //.env 가져오기
const axios = require('axios');
const dayjs = require('dayjs'); // 날짜 계산용
const { ptyMap, formatRainfall } = require('./weather_code_mapping'); //코드매핑 딕트 파일

//요청시간 기준 최신예보 시간
function getBaseTimeFromNow() {
  const now = dayjs();
  const hour = now.hour();
  const minute = now.minute();

  if (minute >= 45) {
    // 예보 생성 및 제공 완료됨
    return `${String(hour).padStart(2, '0')}30`;
  } else {
    // 아직 예보 생성 전이므로 이전 시간대 예보 사용
    const prevHour = hour === 0 ? 23 : hour - 1;
    return `${String(prevHour).padStart(2, '0')}30`;
  }
}

//예보시간 반올림
const getRoundedFcstTime = () => {
  const now = dayjs();
  const hour = now.hour();
  const minute = now.minute();

  if (minute < 30) {
    return `${String(hour).padStart(2, '0')}30`;
  } else {
    return `${String((hour + 1) % 24).padStart(2, '0')}00`;
  }
};

//날씨가져오기
const getWeather = async () => {
  const API_KEY = process.env.API_KEY;
  const base_date = dayjs().format('YYYYMMDD');
  const base_time = getBaseTimeFromNow();
  const fcstTimeTarget = getRoundedFcstTime();
  const nx = 60;
  const ny = 127;
  const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst';

 try {
    const response = await axios.get(url, {
      params: {
        serviceKey: API_KEY,
        base_date,
        base_time,
        nx,
        ny,
        numOfRows: 100,
        pageNo: 1,
        dataType: 'JSON'
      }
    });

    const items = response.data?.response?.body?.items?.item;

    if (!items) {
      console.error('❌ 데이터 없음');
      return;
    }

    const targetCategories = ['T1H', 'RN1', 'PTY', 'WSD', 'REH'];

    // ✨ key-value 형태로 저장 (중복 방지)
    const result = {};

    items.forEach(item => {
      if (
        item.fcstTime === fcstTimeTarget &&
        targetCategories.includes(item.category)
      ) {
        result[item.category] = item.fcstValue;
      }
    });

    console.log(`🕒 ${fcstTimeTarget} 기준 초단기예보`);
    if (result.T1H) console.log(`🌡️ 기온: ${result.T1H}℃`);
    if (result.RN1) console.log(`🌧️ 강수량: ${formatRainfall(result.RN1)}`);
    if (result.PTY) console.log(`☔ 강수형태: ${ptyMap[result.PTY] || '미정'}`);
    if (result.WSD) console.log(`💨 풍속: ${result.WSD}m/s`);
    if (result.REH) console.log(`💧 습도: ${result.REH}%`);

  } catch (err) {
    console.error('❌ 에러 발생:', err.message);
  }
};

getWeather();