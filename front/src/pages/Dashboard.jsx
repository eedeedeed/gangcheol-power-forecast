import React, { useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';

import StatCard from '../components/dashboard/StatCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import IntervalDropdown from '../components/common/IntervalDropdown';
import { BuildingContext } from '../contexts/BuildingContext';
import { getDashboardData } from '../api/dashboard.api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// 🔥 기본 데이터 (건물 데이터가 없을 때 사용할 0값 기본 데이터)
const createDefaultDashboardData = () => ({
  data: {
    currentUsage: 0,
    usagePercentage: 0,
    status: 'normal',
    todayUsage: Array(24).fill(0).map((_, i) => ({ 
      time: `${String(i).padStart(2, '0')}:00`, 
      usage: 0 
    })),
    stats: {
      peak_prediction: { time: "00:00", usage: 0, status: "normal" },
      savings_rate: 0,
      savings_rate_status: "normal",
    },
  }
});

function Dashboard() {
  const { selectedBuildingId } = useContext(BuildingContext);
  const [lineInterval, setLineInterval] = useState('realtime');

  // 🔥 실시간 테마 감지 및 차트 색상 동적 적용
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-color-scheme') === 'dark'
  );

  // 테마 변경 감지
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-color-scheme') {
          setIsDarkMode(document.documentElement.getAttribute('data-color-scheme') === 'dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme']
    });

    return () => observer.disconnect();
  }, []);

  // 🔥 수정된 useQuery - 건물 데이터가 없어도 항상 실행
  const { data: dashboardApiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', selectedBuildingId || 'default'],
    queryFn: async () => {
      try {
        // 건물이 선택되어 있으면 실제 API 호출
        if (selectedBuildingId) {
          console.log('건물 선택됨 - API 호출:', selectedBuildingId);
          return await getDashboardData(selectedBuildingId);
        } else {
          // 건물이 선택되지 않았으면 기본 0값 데이터 사용
          console.log('건물 미선택 - 기본 데이터 사용');
          return Promise.resolve(createDefaultDashboardData());
        }
      } catch (error) {
        console.error('데이터 로드 실패, 기본값 사용:', error);
        return Promise.resolve(createDefaultDashboardData());
      }
    },
    // 🔥 항상 쿼리 실행 (건물 선택 여부와 관계없이)
    enabled: true,
    // 🔥 에러 시에도 기본 데이터로 처리
    retry: false,
    onError: (error) => {
      console.error('Dashboard 쿼리 에러:', error);
    }
  });
  
  // 🔥 로딩 상태도 기본 레이아웃 유지
  if (isLoading) {
    return (
      <div id="dashboard">
        <div className="dashboard-main-layout">
          <div className="dashboard-left">
            <div className="loading-placeholder">날씨 정보 로딩 중...</div>
          </div>
          <div className="dashboard-right">
            <div className="stats-grid">
              <div className="loading-placeholder">데이터 로딩 중...</div>
            </div>
          </div>
        </div>
        <div className="charts-grid">
          <div className="card chart-card">
            <div className="card__header"><h4>실시간 전력 사용량</h4></div>
            <div className="card__body loading-placeholder">차트 로딩 중...</div>
          </div>
          <div className="card chart-card">
            <div className="card__header"><h4>오늘의 전력 사용량 추이</h4></div>
            <div className="card__body loading-placeholder">차트 로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }
  
  // 🔥 에러 상태에서도 기본 데이터로 레이아웃 유지
  let dashboardData;
  if (isError || !dashboardApiResponse?.data) {
    console.log('에러 또는 데이터 없음 - 기본 데이터 사용');
    dashboardData = createDefaultDashboardData().data;
  } else {
    dashboardData = dashboardApiResponse.data;
  }

  // 🔥 안전한 데이터 추출 (기본값 제공)
  const {
    currentUsage = 0,
    usagePercentage = 0,
    status = 'normal',
    todayUsage = Array(24).fill(0).map((_, i) => ({ 
      time: `${String(i).padStart(2, '0')}:00`, 
      usage: 0 
    })),
    stats = {
      peak_prediction: { time: "00:00", usage: 0, status: "normal" },
      savings_rate: 0,
      savings_rate_status: "normal"
    }
  } = dashboardData || {};
  
  // 🔥 안전한 통계 데이터 생성
  const statsData = [
    { 
      title: '현재 사용량', 
      value: `${(currentUsage || 0).toLocaleString()} kWh`, 
      description: `용량의 ${(usagePercentage || 0).toFixed(1)}%`, 
      status: status || 'normal', 
      statusText: (status || 'normal') === 'normal' ? '정상' : '주의'
    },
    { 
      title: '예상 피크', 
      value: `${((stats?.peak_prediction?.usage) || 0).toLocaleString()} kWh`, 
      description: `내일 ${(stats?.peak_prediction?.time) || '00:00'}`, 
      status: (stats?.peak_prediction?.status) || 'normal', 
      statusText: ((stats?.peak_prediction?.status) || 'normal') === 'warning' ? '주의' : '정상' 
    },
    { 
      title: '예상 사용량', 
      value: '640 kWh', 
      description: 'AI 모델 예상값', 
      status: 'normal', 
      statusText: '정보' 
    },
    { 
      title: '절감률', 
      value: `${((stats?.savings_rate) || 0).toFixed(1)}%`, 
      description: '전월 대비', 
      status: (stats?.savings_rate_status) || 'normal', 
      statusText: ((stats?.savings_rate_status) || 'normal') === 'success' ? '우수' : '보통' 
    }
  ];

  // 🔥 다크모드 대응 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2121' : '#ffffff',
        titleColor: isDarkMode ? '#fcfcf9' : '#13343b',
        bodyColor: isDarkMode ? '#fcfcf9' : '#13343b',
        borderColor: isDarkMode ? 'rgba(252, 252, 249, 0.2)' : 'rgba(94, 82, 64, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          family: "'Noto Sans KR', sans-serif",
          weight: '600'
        },
        bodyFont: {
          size: 13,
          family: "'Noto Sans KR', sans-serif"
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: isDarkMode ? 'rgba(252, 252, 249, 0.3)' : 'rgba(94, 82, 64, 0.2)',
          borderColor: isDarkMode ? '#fcfcf9' : '#13343b',
          borderWidth: 1
        },
        ticks: {
          color: isDarkMode ? '#fcfcf9' : '#13343b',
          font: {
            size: 13,
            family: "'Noto Sans KR', sans-serif"
          }
        },
        border: {
          color: isDarkMode ? '#fcfcf9' : '#13343b',
          width: 1
        }
      },
      y: {
        grid: {
          display: true,
          color: isDarkMode ? 'rgba(252, 252, 249, 0.3)' : 'rgba(94, 82, 64, 0.2)',
          borderColor: isDarkMode ? '#fcfcf9' : '#13343b',
          borderWidth: 1
        },
        ticks: {
          color: isDarkMode ? '#fcfcf9' : '#13343b',
          font: {
            size: 13,
            family: "'Noto Sans KR', sans-serif"
          }
        },
        border: {
          color: isDarkMode ? '#fcfcf9' : '#13343b',
          width: 1
        }
      }
    }
  };

  // 🔥 도넛 차트 옵션
  const realtimeGaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    rotation: -90,
    circumference: 360,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderRadius: 0
      }
    },
    events: [],
    animation: {
      animateRotate: true,
      animateScale: false
    }
  };
  
  // 🔥 안전한 차트 데이터 생성
  const todayUsageChartData = {
    labels: (todayUsage || []).map(data => data?.time || '00:00'),
    datasets: [{
      label: '사용량 (kWh)', 
      data: (todayUsage || []).map(data => data?.usage || 0),
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(50, 184, 198, 0.2)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: 'var(--color-primary)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }],
  };
  
  // 🔥 도넛 차트 데이터 - 0값 처리
  const safeUsagePercentage = Math.max(0, Math.min(100, usagePercentage || 0));
  const realtimeGaugeChartData = {
    labels: ['사용량', '남은 용량'],
    datasets: [{
      data: [safeUsagePercentage, 100 - safeUsagePercentage],
      backgroundColor: [
        isDarkMode ? '#32b8c6' : '#21808d',
        isDarkMode ? 'rgba(252, 252, 249, 0.15)' : 'rgba(226, 232, 240, 0.3)'
      ],
      borderColor: [
        isDarkMode ? '#32b8c6' : '#21808d',
        'transparent'
      ],
      borderWidth: 0,
      cutout: '65%',
      hoverBackgroundColor: [
        isDarkMode ? '#2db2c1' : '#1e737e',
        isDarkMode ? 'rgba(252, 252, 249, 0.25)' : 'rgba(226, 232, 240, 0.5)'
      ]
    }],
  };

  return (
    <div id="dashboard">
      <div className="dashboard-main-layout">
        <div className="dashboard-left"><WeatherCard /></div>
        <div className="dashboard-right">
          <div className="stats-grid">
            {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
          </div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card__header"><h4>실시간 전력 사용량</h4></div>
          <div className="card__body" style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="power-gauge-large">
              <Doughnut data={realtimeGaugeChartData} options={realtimeGaugeOptions} />
              <div className="power-gauge-text-large">
                <span id="usagePercentageLarge">{safeUsagePercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card chart-card">
          <div className="card__header card__header--space-between">
            <div className="chart-title-section">
              <h4>오늘의 전력 사용량 추이</h4>
              <span className="chart-subtitle">시간별 사용량 (kW)</span>
            </div>
            <IntervalDropdown activeInterval={lineInterval} onIntervalChange={setLineInterval} />
          </div>
          <div className="card__body" style={{ position: 'relative', height: '300px' }}>
            <Line data={todayUsageChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
