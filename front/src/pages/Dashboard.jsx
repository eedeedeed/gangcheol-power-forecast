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

// 임시 데이터 생성 함수 (API 연동 전까지 사용)
const createMockDashboardData = () => ({
  data: {
    currentUsage: Math.floor(Math.random() * 2000),
    usagePercentage: Math.random() * 100,
    status: Math.random() > 0.5 ? 'normal' : 'warning',
    todayUsage: Array(24).fill(0).map((_, i) => ({ time: `${String(i).padStart(2, '0')}:00`, usage: 400 + Math.random() * 800 })),
    stats: {
        peak_prediction: { time: "15:00", usage: 1820, status: "warning" },
        savings_rate: 12.3, savings_rate_status: "success",
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

  const { data: dashboardApiResponse, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', selectedBuildingId],
    queryFn: () => {
        // 실제 API 호출 (주석 처리)
        // return getDashboardData(selectedBuildingId)

        // 백엔드 연동 전까지 임시 데이터 반환
        return Promise.resolve(createMockDashboardData());
    },
    enabled: !!selectedBuildingId,
  });
  
  if (isLoading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }
  
  if (isError) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }

  // API 응답에서 실제 데이터 추출 (axios는 보통 response.data에 담겨 옴)
  const dashboardData = dashboardApiResponse?.data;

  // 데이터가 아직 없으면 렌더링하지 않음
  if (!dashboardData) {
    return <div>선택된 건물의 데이터를 표시할 수 없습니다.</div>;
  }

  const { currentUsage, usagePercentage, status, todayUsage, stats } = dashboardData;
  
  const statsData = [
    { title: '현재 사용량', value: `${currentUsage.toLocaleString()} kW`, description: `용량의 ${usagePercentage.toFixed(1)}%`, status: status, statusText: status === 'normal' ? '정상' : '주의'},
    { title: '예상 피크', value: `${stats.peak_prediction.usage.toLocaleString()} kW`, description: `내일 ${stats.peak_prediction.time}`, status: stats.peak_prediction.status, statusText: stats.peak_prediction.status === 'warning' ? '주의' : '정상' },
    { title: '예상 사용량', value: '1,750 kW', description: '내일 평균', status: 'normal', statusText: '정보' },
    { title: '절감률', value: `${stats.savings_rate.toFixed(1)}%`, description: '전월 대비', status: stats.savings_rate_status, statusText: stats.savings_rate_status === 'success' ? '우수' : '보통' }
  ];

  // 🔥 다크모드 대응 차트 옵션 - 완전 해결
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
          color: isDarkMode ? 'rgba(252, 252, 249, 0.3)' : 'rgba(94, 82, 64, 0.2)', // 🔥 확실한 색상 구분
          borderColor: isDarkMode ? '#fcfcf9' : '#13343b',
          borderWidth: 1
        },
        ticks: {
          color: isDarkMode ? '#fcfcf9' : '#13343b', // 🔥 확실한 흰색/검은색
          font: {
            size: 13,
            family: "'Noto Sans KR', sans-serif"
          }
        },
        border: {
          color: isDarkMode ? '#fcfcf9' : '#13343b', // 🔥 확실한 축 색상
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
          color: isDarkMode ? '#fcfcf9' : '#13343b', // 🔥 확실한 흰색/검은색
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

  // 🔥 도넛 차트 옵션 - 수정된 버전
  const realtimeGaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    rotation: -90, // 시작점을 상단으로
    circumference: 360, // 전체 원
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false // 기존과 동일 (툴팁 비활성화)
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderRadius: 0
      }
    },
    events: [], // 🔥 이벤트 비활성화 (기존 기능 유지)
    animation: {
      animateRotate: true,
      animateScale: false
    }
  };
  
  const todayUsageChartData = {
    labels: todayUsage.map(data => data.time),
    datasets: [{
        label: '사용량 (kWh)', 
        data: todayUsage.map(data => data.usage),
        borderColor: 'var(--color-primary)', // 테마 색상 사용
        backgroundColor: 'rgba(50, 184, 198, 0.2)',
        tension: 0.4, // 부드러운 곡선
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'var(--color-primary)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
    }],
  };
  
  // 🔥 도넛 차트 데이터 - 청록색 계열로 색상 수정
  const realtimeGaugeChartData = {
    labels: ['사용량', '남은 용량'],
    datasets: [{
        data: [usagePercentage, 100 - usagePercentage],
        backgroundColor: [
          isDarkMode ? '#32b8c6' : '#21808d', // 🔥 청록색 계열 (Teal-300 : Teal-500)
          isDarkMode ? 'rgba(252, 252, 249, 0.15)' : 'rgba(226, 232, 240, 0.3)' // 남은 용량 부분
        ],
        borderColor: [
          isDarkMode ? '#32b8c6' : '#21808d',
          'transparent'
        ],
        borderWidth: 0,
        cutout: '65%',
        // 🔥 호버 효과도 청록색으로 설정
        hoverBackgroundColor: [
          isDarkMode ? '#2db2c1' : '#1e737e', // 호버 시 약간 더 진한 청록색
          isDarkMode ? 'rgba(252, 252, 249, 0.25)' : 'rgba(226, 232, 240, 0.5)'
        ]
    }],
  };

  return (
    <div id="dashboard">
      <div className="dashboard-main-layout">
        <div className="dashboard-left"><WeatherCard /></div>
        <div className="dashboard-right">
          <div className="stats-grid">{statsData.map((stat, index) => <StatCard key={index} {...stat} />)}</div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card__header"><h4>실시간 전력 사용량</h4></div>
          <div className="card__body" style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="power-gauge-large">
              {/* 🔥 청록색 계열 도넛 차트 */}
              <Doughnut data={realtimeGaugeChartData} options={realtimeGaugeOptions} />
              <div className="power-gauge-text-large">
                <span id="usagePercentageLarge">{usagePercentage.toFixed(1)}%</span>
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
            {/* 🔥 다크모드 XY축 텍스트 완전 해결된 라인 차트 */}
            <Line data={todayUsageChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
