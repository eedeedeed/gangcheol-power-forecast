// src/components/Dashboard.jsx
// 이 파일은 애플리케이션의 메인 대시보드 컴포넌트입니다.
// 실시간 전력 사용량, 예상 피크, 절감률, 절약 비용 등 주요 통계를 표시하고,
// 오늘의 전력 사용량 추이 및 실시간 게이지 차트를 렌더링합니다.

import React, { useEffect, useState, useRef } from 'react';
// Chart.js의 Line 및 Doughnut 차트 컴포넌트를 임포트합니다.
import { Line, Doughnut } from 'react-chartjs-2';
// Chart.js의 핵심 모듈들을 임포트합니다.
import {
  Chart as ChartJS,
  CategoryScale, // X축 카테고리 스케일
  LinearScale,   // Y축 선형 스케일
  PointElement,  // 라인 차트의 데이터 포인트
  LineElement,   // 라인 차트의 라인
  Title,         // 차트 제목
  Tooltip,       // 툴팁 (데이터 위에 마우스 오버 시 정보 표시)
  Legend,        // 범례
  ArcElement     // 도넛/파이 차트의 호 (게이지 차트를 위해 필요)
} from 'chart.js';

// Chart.js에 필요한 모듈들을 등록합니다.
// 이 과정은 차트가 올바르게 렌더링되기 위해 반드시 필요합니다.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// 날씨 아이콘 컴포넌트
const WeatherIcon = ({ condition, size = 48 }) => {
  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'snow': '❄️',
      'thunderstorm': '⛈️',
      'drizzle': '🌦️',
      'mist': '🌫️',
      'fog': '🌫️'
    };
    return iconMap[condition] || '🌤️';
  };

  return (
    <span style={{ fontSize: `${size}px` }}>
      {getWeatherIcon(condition)}
    </span>
  );
};

// 날씨 카드 컴포넌트
const WeatherCard = () => {
  const [weather, setWeather] = useState({
    temperature: '--',
    condition: 'clear',
    description: '날씨 정보 로딩 중...',
    humidity: '--',
    windSpeed: '--',
    location: '서울'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날씨 데이터 가져오기
  const fetchWeather = async () => {
    try {
      setLoading(true);
      
      // OpenWeatherMap API 사용 (무료, API 키 필요)
      // 실제 사용시 본인의 API 키로 교체하세요
      const API_KEY = 'YOUR_API_KEY_HERE';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Seoul,KR&appid=${API_KEY}&units=metric&lang=kr`
      );
      
      if (!response.ok) {
        throw new Error('날씨 정보를 가져올 수 없습니다.');
      }
      
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
        location: data.name
      });
      
      setError(null);
    } catch (err) {
      console.error('날씨 API 오류:', err);
      setError(err.message);
      
      // 오류 시 더미 데이터 표시
      setWeather({
        temperature: 23,
        condition: 'clear',
        description: '맑음',
        humidity: 45,
        windSpeed: 12,
        location: '서울'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // 10분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-card-large">
      <div className="weather-header">
        <h3>실시간 날씨(목업입니다)</h3>
        <button className="weather-refresh-btn" onClick={fetchWeather} disabled={loading}>
          🔄
        </button>
      </div>
      
      <div className="weather-body">
        {loading ? (
          <div className="weather-loading">
            <div className="loading-spinner"></div>
            <p>날씨 정보 로딩 중...</p>
          </div>
        ) : (
          <div className="weather-content">
            <div className="weather-main">
              <div className="weather-icon">
                <WeatherIcon condition={weather.condition} size={80} />
              </div>
              <div className="weather-temp">
                <span className="temp-value">{weather.temperature}</span>
                <span className="temp-unit">°C</span>
              </div>
            </div>
            
            <div className="weather-info">
              <div className="weather-location">{weather.location}</div>
              <div className="weather-description">{weather.description}</div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="detail-label">습도</span>
                <span className="detail-value">{weather.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">풍속</span>
                <span className="detail-value">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Dashboard({ currentPower, todayUsage, tomorrowPrediction, stats, selectedBuildingData, onIntervalChange }) {
  // props:
  // - onIntervalChange: 표시할 시간 간격 변경을 위한 함수

  // 각 차트별로 독립적인 시간 간격 상태 관리
  const [gaugeInterval, setGaugeInterval] = useState('realtime'); // 게이지 차트용
  const [lineInterval, setLineInterval] = useState('realtime');   // 라인 차트용

  // 게이지 차트 간격 변경 핸들러
  const handleGaugeIntervalChange = (interval) => {
    setGaugeInterval(interval);
    onIntervalChange(interval); // 필요시 AppContext 업데이트
  };

  // 라인 차트 간격 변경 핸들러
  const handleLineIntervalChange = (interval) => {
    setLineInterval(interval);
    onIntervalChange(interval); // 필요시 AppContext 업데이트
  };

  // 드롭다운 메뉴 컴포넌트 (독립적인 상태 관리)
  const IntervalDropdown = ({ activeInterval, onIntervalChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const intervals = [
      { key: 'realtime', label: '실시간' },
      { key: '15min', label: '15분' },
      { key: '30min', label: '30분' },
      { key: '60min', label: '1시간' }
    ];
    
    const currentInterval = intervals.find(item => item.key === activeInterval);
    
    const handleSelect = (intervalKey) => {
      onIntervalChange(intervalKey);
      setIsOpen(false);
    };
    
    // 외부 클릭 감지를 위한 ref와 effect
    const dropdownRef = useRef(null);
    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    return (
      <div className={`interval-dropdown ${className}`} ref={dropdownRef}>
        <button
          className={`dropdown-button ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span>{currentInterval?.label || '실시간'}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
          {intervals.map((interval) => (
            <button
              key={interval.key}
              className={`dropdown-item ${activeInterval === interval.key ? 'selected' : ''}`}
              onClick={() => handleSelect(interval.key)}
              type="button"
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 오늘의 전력 사용량 추이 차트 데이터를 관리하는 상태입니다.
  const [todayUsageChartData, setTodayUsageChartData] = useState({
    labels: todayUsage.map(data => data.time), // X축 레이블 (시간)
    datasets: [
      {
        label: '사용량 (kWh)', // 데이터셋의 이름
        data: todayUsage.map(data => data.usage), // Y축 데이터 (사용량)
        borderColor: 'rgba(50, 184, 198, 1)', // 라인 색상 (청록색)
        backgroundColor: 'rgba(50, 184, 198, 0.2)', // 라인 아래 채우기 색상 (투명도 조절된 청록색)
        tension: 0.3, // 라인을 부드러운 곡선으로 만듭니다.
        fill: true, // 라인 아래 영역을 채웁니다.
      },
    ],
  });

  // 실시간 전력 사용량 게이지 차트 데이터를 관리하는 상태입니다.
  const [realtimeGaugeChartData, setRealtimeGaugeChartData] = useState({
    labels: ['사용량', '남은 용량'], // 도넛 차트의 각 섹션 레이블
    datasets: [
      {
        data: [currentPower.percentage, 100 - currentPower.percentage], // 사용량 퍼센트와 남은 용량 퍼센트
        backgroundColor: ['rgba(50, 184, 198, 1)', '#3A3A3A'], // 사용량 부분은 청록색, 남은 용량 부분은 어두운 회색
        borderColor: 'transparent', // 테두리 없음
        borderWidth: 0, // 테두리 두께 0
        cutout: '65%', // 도넛 차트의 중앙 구멍 크기
        circumference: 360, // 차트가 전체 원형이 되도록 설정 (기본값)
        rotation: 0, // 차트 시작 각도 (기본값)
      },
    ],
  });

  // `currentPower.percentage` prop이 변경될 때마다 게이지 차트 데이터를 업데이트합니다.
  useEffect(() => {
    setRealtimeGaugeChartData(prevData => {
      const newData = { ...prevData };
      newData.datasets[0].data = [currentPower.percentage, 100 - currentPower.percentage];
      return newData;
    });
  }, [currentPower.percentage]);

  // Chart.js의 공통 옵션입니다.
  const chartOptions = {
    responsive: true, // 차트 크기를 부모 컨테이너에 맞게 조절
    maintainAspectRatio: false, // 종횡비 유지를 비활성화하여 높이 조절 가능하게 함
    plugins: {
      legend: {
        display: false, // 범례를 표시하지 않습니다.
      },
      title: {
        display: false, // 제목을 표시하지 않습니다.
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(119, 124, 124, 0.1)', // X축 그리드 라인 색상 (투명도 적용)
        },
        ticks: {
          color: '#FFFFFF', // X축 레이블(시간) 색상을 흰색으로 고정
          font: {
            size: 12, // 폰트 크기 (원하는 크기로 조절)
            family: 'Noto Sans KR, sans-serif', // 한글 폰트 우선 적용
            weight: 'normal' // 폰트 두께
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(119, 124, 124, 0.1)', // Y축 그리드 라인 색상 (투명도 적용)
        },
        ticks: {
          color: '#FFFFFF', // Y축 레이블(사용량) 색상을 흰색으로 고정
          font: {
            size: 12, // 폰트 크기 (원하는 크기로 조절)
            family: 'Noto Sans KR, sans-serif', // 한글 폰트 우선 적용
            weight: 'normal' // 폰트 두께
          }
        }
      },
    },
  };

  // 게이지 차트 제목 생성 함수
  const getGaugeChartTitle = () => {
    switch (gaugeInterval) {
      case 'realtime':
        return '실시간 전력 사용량';
      case '15min':
        return '15분 평균 사용량';
      case '30min':
        return '30분 평균 사용량';
      case '60min':
        return '1시간 평균 사용량';
      default:
        return '실시간 전력 사용량';
    }
  };

  // 라인 차트 제목 생성 함수
  const getLineChartTitle = () => {
    switch (lineInterval) {
      case 'realtime':
        return '오늘의 실시간 전력 사용량 추이';
      case '15min':
        return '오늘의 15분 평균 사용량 추이';
      case '30min':
        return '오늘의 30분 평균 사용량 추이';
      case '60min':
        return '오늘의 1시간 평균 사용량 추이';
      default:
        return '오늘의 전력 사용량 추이';
    }
  };

  return (
    // 대시보드 페이지의 최상위 컨테이너입니다.
    <div id="dashboard">

      {/* 메인 레이아웃 - 좌우 분할 */}
      <div className="dashboard-main-layout">
        
        {/* 왼쪽 영역 - 노란색 네모 위치에 날씨 카드 */}
        <div className="dashboard-left">
          <WeatherCard />
        </div>

        {/* 오른쪽 영역 - stats 카드들 */}
        <div className="dashboard-right">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h4>현재 사용량</h4>
                <span className={`status ${selectedBuildingData.status === 'normal' ? 'status--info' : 'status--warning'}`}>
                  {selectedBuildingData.status === 'normal' ? '정상' : '주의'}
                </span>
              </div>
              <div className="stat-body">
                <p className="current-usage-value">{currentPower.usage.toLocaleString()} kW</p>
                <p className="current-usage-percentage">용량의 {currentPower.percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h4>예상 피크</h4>
                <span className={`status status--${stats.peak_prediction.status}`}>
                  {stats.peak_prediction.status === 'warning' ? '주의' : '정상'}
                </span>
              </div>
              <div className="stat-body">
                <p className="peak-usage-value">{stats.peak_prediction.usage.toLocaleString()} kW</p>
                <p className="peak-time">내일 {stats.peak_prediction.time}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h4>예상 사용량</h4>
                <span className="status status--info">정보</span>
              </div>
              <div className="stat-body">
                <p className="current-usage-value">1,750 kW</p>
                <p className="current-usage-percentage">내일 평균</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h4>절감률</h4>
                <span className={`status status--${stats.savings_rate_status}`}>
                  {stats.savings_rate_status === 'success' ? '우수' : '보통'}
                </span>
              </div>
              <div className="stat-body">
                <p className="savings-rate-value">{stats.savings_rate.toFixed(1)}%</p>
                <p className="savings-rate-description">전월 대비</p>
              </div>
            </div>
            {/* <div className="stat-card">
              <div className="stat-header">
                <h4>절약 비용</h4>
                <span className={`status status--${stats.cost_saved_status}`}>
                  {stats.cost_saved_status === 'success' ? '달성' : '목표'}
                </span>
              </div>
              <div className="stat-body">
                <p className="cost-saved-value">{stats.cost_saved.toLocaleString()}원</p>
                <p className="cost-saved-description">이번 달</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* 차트들을 담는 그리드 컨테이너입니다. */}
      <div className="charts-grid">
        {/* 실시간 전력 사용량 게이지 차트 카드 - 독립적인 설정 */}
        <div className="card chart-card">
          <div className="card__header card__header--space-between">
            <h4>{getGaugeChartTitle()}</h4>
            <IntervalDropdown 
              activeInterval={gaugeInterval}
              onIntervalChange={handleGaugeIntervalChange}
            />
          </div>
          {/* 차트 본문입니다. 게이지 차트와 텍스트를 중앙에 배치합니다. */}
          <div className="card__body" style={{position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
           {/* 게이지 차트 컨테이너입니다. */}
<div className="power-gauge-large">
  {/* Doughnut 차트 컴포넌트입니다. */}
  <Doughnut data={realtimeGaugeChartData} options={{
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  // ✨ 모든 이벤트와 상호작용 완전 차단
  events: [], // 모든 이벤트 비활성화
  onHover: null, // 호버 이벤트 제거
  onClick: null, // 클릭 이벤트 제거
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
}} />


              {/* 게이지 차트 중앙에 표시될 텍스트 (퍼센트)입니다. */}
              <div className="power-gauge-text-large">
                <span id="usagePercentageLarge">{currentPower.percentage.toFixed(1)}%</span> {/* 현재 사용량 퍼센트 표시 */}
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 전력 사용량 추이 라인 차트 카드 - 독립적인 설정 */}
        <div className="card chart-card">
          <div className="card__header card__header--space-between">
            <div className="chart-title-section">
              <h4>{getLineChartTitle()}</h4>
              <span className="chart-subtitle">시간별 사용량 (kW)</span>
            </div>
            <IntervalDropdown 
              activeInterval={lineInterval}
              onIntervalChange={handleLineIntervalChange}
            />
          </div>
          {/* 차트 본문입니다. 라인 차트가 포함됩니다. */}
          <div className="card__body" style={{position: 'relative', height: '300px'}}>
            {/* Line 차트 컴포넌트입니다. `todayUsageChartData`와 `chartOptions`를 전달합니다. */}
            <Line data={todayUsageChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
