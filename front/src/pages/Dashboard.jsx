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

// [추가] UI 확인을 위한 가상 더미 데이터 생성 함수
const createDummyDashboardData = () => ({
  data: {
    currentUsage: 785,
    usagePercentage: 65.4,
    status: 'warning',
    // 0시부터 23시까지의 가상 사용량 데이터 (300에서 800 사이의 랜덤 값)
    todayUsage: Array(24).fill(0).map((_, i) => ({ 
      time: `${String(i).padStart(2, '0')}:00`, 
      usage: Math.floor(Math.random() * (800 - 300 + 1)) + 300
    })),
    stats: {
      peak_prediction: { time: "15:00", usage: 950, status: "warning" },
      savings_rate: -5.2, // 전월 대비 5.2% 증가 (절감률은 음수)
      savings_rate_status: "warning",
    },
  }
});

// 기존의 0으로 채워진 기본 데이터
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

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-color-scheme') === 'dark'
  );

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
    queryKey: ['dashboard', selectedBuildingId || 'default'],
    queryFn: async () => {
      try {
        if (selectedBuildingId) {
          console.log('건물 선택됨 - API 호출:', selectedBuildingId);
          return await getDashboardData(selectedBuildingId);
        } else {
          // [수정됨] 건물이 선택되지 않았을 때, 0 대신 가상 더미 데이터를 보여줍니다.
          console.log('건물 미선택 - 가상 더미 데이터 사용');
          return Promise.resolve(createDummyDashboardData());
        }
      } catch (error) {
        console.error('데이터 로드 실패, 기본값 사용:', error);
        return Promise.resolve(createDefaultDashboardData());
      }
    },
    enabled: true,
    retry: false,
    onError: (error) => {
      console.error('Dashboard 쿼리 에러:', error);
    }
  });
  
  if (isLoading) {
    return (
      <div id="dashboard">
        {/* ... 로딩 UI ... */}
      </div>
    );
  }
  
  let dashboardData;
  if (isError || !dashboardApiResponse?.data) {
    dashboardData = createDefaultDashboardData().data;
  } else {
    dashboardData = dashboardApiResponse.data;
  }

  const {
    currentUsage = 0,
    usagePercentage = 0,
    status = 'normal',
    todayUsage = [],
    stats = {}
  } = dashboardData || {};
  
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // ... (차트 옵션 생략)
  };

  const realtimeGaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // ... (도넛 차트 옵션 생략)
  };
  
  const todayUsageChartData = {
    labels: (todayUsage || []).map(data => data?.time || '00:00'),
    datasets: [{
      label: '사용량 (kWh)', 
      data: (todayUsage || []).map(data => data?.usage || 0),
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(50, 184, 198, 0.2)',
      // ... (데이터셋 스타일 생략)
    }],
  };
  
  const safeUsagePercentage = Math.max(0, Math.min(100, usagePercentage || 0));
  const realtimeGaugeChartData = {
    labels: ['사용량', '남은 용량'],
    datasets: [{
      data: [safeUsagePercentage, 100 - safeUsagePercentage],
      backgroundColor: [
        isDarkMode ? '#32b8c6' : '#21808d',
        isDarkMode ? 'rgba(252, 252, 249, 0.15)' : 'rgba(226, 232, 240, 0.3)'
      ],
      // ... (데이터셋 스타일 생략)
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
