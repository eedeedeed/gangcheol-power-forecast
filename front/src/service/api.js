//현재 전력 사용량
const powerData = {
  current_power: {
    usage: 1244,     // 현재 사용량 (kW)
    capacity: 2000,  // 총 용량 (kW)
    percentage: 62.2 // 용량 대비 사용량 퍼센트
  },
  // 오늘 시간별 전력 사용량 데이터(라인 차트 등에 사용)
  today_usage: [
    {time: "00:00", usage: 450}, {time: "01:00", usage: 420}, {time: "02:00", usage: 400},
    {time: "03:00", usage: 380}, {time: "04:00", usage: 390}, {time: "05:00", usage: 430},
    {time: "06:00", usage: 580}, {time: "07:00", usage: 750}, {time: "08:00", usage: 920},
    {time: "09:00", usage: 1100}, {time: "10:00", usage: 1200}, {time: "11:00", usage: 1247},
    {time: "12:00", usage: 1350}, {time: "13:00", usage: 1420}, {time: "14:00", usage: 1580},
    {time: "15:00", usage: 1750}, {time: "16:00", usage: 1680}, {time: "17:00", usage: 1550},
    {time: "18:00", usage: 1320}, {time: "19:00", usage: 1120}, {time: "20:00", usage: 970},
    {time: "21:00", usage: 820}, {time: "22:00", usage: 670}, {time: "23:00", usage: 520}
  ],
  // 내일 시간별 전력 사용량 예측 데이터(현재 앱에서는 사용되지 않음)
  tomorrow_prediction: [
    {time: "00:00", usage: 460, confidence: 95}, {time: "01:00", usage: 430, confidence: 94}, {time: "02:00", usage: 410, confidence: 93},
    {time: "03:00", usage: 390, confidence: 92}, {time: "04:00", usage: 400, confidence: 91}, {time: "05:00", usage: 440, confidence: 90},
    {time: "06:00", usage: 590, confidence: 89}, {time: "07:00", usage: 760, confidence: 88}, {time: "08:00", usage: 930, confidence: 87},
    {time: "09:00", usage: 1110, confidence: 86}, {time: "10:00", usage: 1210, confidence: 85}, {time: "11:00", usage: 1250, confidence: 84},
    {time: "12:00", usage: 1360, confidence: 83}, {time: "13:00", usage: 1430, confidence: 82}, {time: "14:00", usage: 1590, confidence: 81},
    {time: "15:00", usage: 1820, confidence: 80}, // 스크린샷 값으로 업데이트
    {time: "16:00", usage: 1700, confidence: 81}, {time: "17:00", usage: 1570, confidence: 82},
    {time: "18:00", usage: 1320, confidence: 83}, {time: "19:00", usage: 1120, confidence: 85},
    {time: "20:00", usage: 970, confidence: 87}, {time: "21:00", usage: 820, confidence: 89},
    {time: "22:00", usage: 670, confidence: 91}, {time: "23:00", usage: 520, confidence: 93}
  ],
  // 주요 통계 데이터입니다.
  stats: {
    // 예상 피크 사용량 정보
    peak_prediction: {
      time: "15:00",   // 예상 피크 발생 시간
      usage: 1820,     // 예상 피크 사용량 (kW)
      status: "warning" // 피크 상태 ('warning' 또는 'normal')
    },
    savings_rate: 12.3,       // 전월 대비 절감률 (%)
    savings_rate_status: "success", // 절감률 상태 ('success' 또는 'normal')
    monthly_cost: 2845000,    // 월별 예상 비용
    cost_saved: 350000,       // 이번 달 절약된 비용 (원)
    cost_saved_status: "success" // 절약 비용 달성 상태 ('success' 또는 'target')
  },
  // 건물 목록 및 각 건물의 현재 상태입니다.
  buildings: [
    {
      id: 1,
      name: "강철빌딩 본관",
      type: "상업",
      area: 25000,
      coolingArea: 18000,
      pcsCapacity: 500,
      essCapacity: 1000,
      solarCapacity: 200,
      address: "서울특별시 강남구 테헤란로 123",
      detailAddress: "15층",
      current: 1247,
      status: "normal"
    },
    {
      id: 2,
      name: "강철 R&D 센터",
      type: "연구소",
      area: 18000,
      coolingArea: 15000,
      pcsCapacity: 300,
      essCapacity: 600,
      solarCapacity: 150,
      address: "대전광역시 유성구 과학로 456",
      detailAddress: "A동",
      current: 845,
      status: "normal"
    },
    {
      id: 3,
      name: "강철 스마트팩토리",
      type: "공장",
      area: 55000,
      coolingArea: 35000,
      pcsCapacity: 1200,
      essCapacity: 2500,
      solarCapacity: 500,
      address: "경기도 평택시 산업단지로 789",
      detailAddress: "3라인",
      current: 1580,
      status: "warning"
    }
  ],
  // 알림 목록입니다.
  alerts: [
    {
      id: 1,
      type: "warning", // 알림 유형: 경고
      title: "피크 사용량 임박",
      time: "15:00",
      message: "본관의 전력 사용량이 피크 예상치에 근접하고 있습니다. 불필요한 전력 소모를 줄여주세요."
    },
    {
      id: 2,
      type: "info",    // 알림 유형: 정보
      title: "월별 목표 달성",
      time: "07/25",
      message: "이번 달 전력 절감 목표를 초과 달성했습니다. 지속적인 노력을 부탁드립니다."
    },
    {
      id: 3,
      type: "warning", // 알림 유형: 경고
      title: "생산동 이상 전력 감지",
      time: "07/24",
      message: "생산동에서 비정상적인 전력 사용 패턴이 감지되었습니다. 확인이 필요합니다."
    }
  ],
  // 전력 절감 가이드 목록입니다.
  savings_guide: [
    {
      action: "불필요한 조명 소등",
      expected_saving: "50 kWh",
      description: "사용하지 않는 공간의 조명을 끄면 전력 소비를 줄일 수 있습니다."
    },
    {
      action: "적정 실내 온도 유지",
      expected_saving: "80 kWh",
      description: "여름철 실내 온도를 1도 올리고, 겨울철 1도 내리면 에너지 절약에 도움이 됩니다."
    },
    {
      action: "대기전력 차단",
      expected_saving: "30 kWh",
      description: "사용하지 않는 전자기기의 플러그를 뽑거나 멀티탭을 끄면 대기전력을 절감할 수 있습니다."
    },
    {
      action: "고효율 기기 사용",
      expected_saving: "100 kWh",
      description: "에너지 효율 등급이 높은 기기를 사용하면 장기적으로 전력 비용을 크게 절감할 수 있습니다."
    }
  ]
};

// --- API 함수 ---

/**
 * 초기 전력 데이터를 가져오는 API 함수 (시뮬레이션)
 * @returns {object} powerData 객체
 */
export const getInitialPowerData = () => {
  // 실제 애플리케이션에서는 fetch, axios 등을 사용하여
  // 백엔드 API로부터 데이터를 비동기적으로 가져옵니다.
  return powerData;
};
