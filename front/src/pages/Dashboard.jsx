import React, { useState, useContext } from 'react';
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

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(119, 124, 124, 0.1)' }, ticks: { color: 'var(--color-text)', font: { size: 12 } } },
      y: { grid: { color: 'rgba(119, 124, 124, 0.1)' }, ticks: { color: 'var(--color-text)', font: { size: 12 } } },
    },
  };
  
  const todayUsageChartData = {
    labels: todayUsage.map(data => data.time),
    datasets: [{
        label: '사용량 (kWh)', data: todayUsage.map(data => data.usage),
        borderColor: 'rgba(50, 184, 198, 1)', backgroundColor: 'rgba(50, 184, 198, 0.2)',
        tension: 0.3, fill: true,
    }],
  };
  
  const realtimeGaugeChartData = {
    labels: ['사용량', '남은 용량'],
    datasets: [{
        data: [usagePercentage, 100 - usagePercentage],
        backgroundColor: ['rgba(50, 184, 198, 1)', 'var(--color-surface)'],
        borderColor: 'transparent', borderWidth: 0, cutout: '65%',
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
              <Doughnut data={realtimeGaugeChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', events: [], plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
              <div className="power-gauge-text-large"><span id="usagePercentageLarge">{usagePercentage.toFixed(1)}%</span></div>
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
          <div className="card__body" style={{ position: 'relative', height: '300px' }}><Line data={todayUsageChartData} options={chartOptions} /></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;