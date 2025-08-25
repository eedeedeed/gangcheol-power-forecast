import React, { useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Link } from 'react-router-dom'; // 👈 [추가] Link import

import StatCard from '../components/dashboard/StatCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import IntervalDropdown from '../components/common/IntervalDropdown';
import { BuildingContext } from '../contexts/BuildingContext';
import { NotificationContext } from '../contexts/NotificationContext'; // 👈 [추가] NotificationContext import
import { getDashboardData } from '../api/dashboard.api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// 더미 데이터 및 기본 데이터 생성 함수 (기존과 동일)
const createDummyDashboardData = () => ({
  data: {
    currentUsage: 785,
    usagePercentage: 65.4,
    status: 'warning',
    todayUsage: Array(24).fill(0).map((_, i) => ({ 
      time: `${String(i).padStart(2, '0')}:00`, 
      usage: Math.floor(Math.random() * (800 - 300 + 1)) + 300
    })),
    stats: {
      peak_prediction: { time: "15:00", usage: 950, status: "warning" },
      savings_rate: -5.2,
      savings_rate_status: "warning",
    },
  }
});
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
  // 👇 [추가] NotificationContext에서 필요한 데이터와 함수를 가져옵니다.
  const { alerts, guides, setHighlightedAlertId, setHighlightedGuideId } = useContext(NotificationContext);

  const [lineInterval, setLineInterval] = useState('realtime');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.getAttribute('data-color-scheme') === 'dark');

  // 👇 [추가] 알림 및 가이드 클릭 시 하이라이트 효과를 주기 위한 함수입니다.
  const handleAlertClick = (alertId) => setHighlightedAlertId(alertId);
  const handleGuideClick = (guideIndex) => setHighlightedGuideId(guideIndex);

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.getAttribute('data-color-scheme') === 'dark'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color-scheme'] });
    return () => observer.disconnect();
  }, []);

  const { data: dashboardApiResponse, isLoading, isError } = useQuery({
    queryKey: ['dashboard', selectedBuildingId || 'default'],
    queryFn: () => selectedBuildingId ? getDashboardData(selectedBuildingId) : Promise.resolve(createDummyDashboardData()),
    enabled: true,
    retry: false,
  });
  
  // (차트 색상, 옵션, 데이터 설정 등 나머지 로직은 기존과 동일)
  const primaryColor = isDarkMode ? '#32b8c6' : '#21808d';
  const textColor = isDarkMode ? 'rgba(252, 252, 249, 0.9)' : '#13343B';
  const secondaryTextColor = isDarkMode ? 'rgba(167, 169, 169, 0.8)' : '#626c71';
  const gridColor = isDarkMode ? 'rgba(252, 252, 249, 0.1)' : 'rgba(94, 82, 64, 0.1)';
  const lineAreaColor = isDarkMode ? 'rgba(50, 184, 198, 0.15)' : 'rgba(33, 128, 141, 0.15)';
  const tooltipBackgroundColor = isDarkMode ? 'rgba(31, 33, 33, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  const dashboardData = isError || !dashboardApiResponse?.data ? createDefaultDashboardData().data : dashboardApiResponse.data;
  const { currentUsage = 0, usagePercentage = 0, status = 'normal', todayUsage = [], stats = {} } = dashboardData || {};
  
  const statsData = [
    { title: '현재 사용량', value: `${(currentUsage || 0).toLocaleString()} kWh`, description: `용량의 ${(usagePercentage || 0).toFixed(1)}%`, status: status || 'normal', statusText: (status || 'normal') === 'normal' ? '정상' : '주의' },
    { title: '예상 피크', value: `${((stats?.peak_prediction?.usage) || 0).toLocaleString()} kWh`, description: `내일 ${(stats?.peak_prediction?.time) || '00:00'}`, status: (stats?.peak_prediction?.status) || 'normal', statusText: ((stats?.peak_prediction?.status) || 'normal') === 'warning' ? '주의' : '정상' },
    { title: '예상 사용량', value: '0 kWh', description: 'AI 모델 예상값', status: 'normal', statusText: '정보' },
    { title: '절감률', value: `${((stats?.savings_rate) || 0).toFixed(1)}%`, description: '전월 대비', status: (stats?.savings_rate_status) || 'normal', statusText: ((stats?.savings_rate_status) || 'normal') === 'success' ? '우수' : '보통' }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor } },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBackgroundColor,
        titleColor: textColor,
        bodyColor: secondaryTextColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: secondaryTextColor } },
      y: { grid: { color: gridColor }, ticks: { color: secondaryTextColor }, min: 0 }
    }
  };
  
  const todayUsageChartData = {
    labels: (todayUsage || []).map(data => data?.time || '00:00'),
    datasets: [{
      label: '사용량 (kWh)', 
      data: (todayUsage || []).map(data => data?.usage || 0),
      fill: true,
      borderColor: primaryColor,
      backgroundColor: lineAreaColor,
      pointBackgroundColor: primaryColor,
      pointBorderColor: primaryColor,
      tension: 0.3
    }],
  };
  
  if (isLoading) return <div id="dashboard">Loading...</div>;

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
      {/* 👇 [수정됨] charts-grid 구조 변경 */}
      <div className="charts-grid">
        {/* 왼쪽 칸: 전력 사용량 추이 차트 */}
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

        {/* 오른쪽 칸: 알림 및 가이드 요약 */}
        <div className="dashboard-side-panel">
          <div className="card">
            <div className="card__body">
              <section className="info-section">
                <h4>빠른 알림</h4>
                <div className="quick-info-list">
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <Link to="/alerts" key={alert.id} className="quick-info-item" onClick={() => handleAlertClick(alert.id)}>
                        <span>{alert.title}</span>
                      </Link>
                    ))
                  ) : (<p className="no-info-text">새로운 알림이 없습니다.</p>)}
                </div>
              </section>
            </div>
          </div>
          <div className="card">
            <div className="card__body">
              <section className="info-section">
                <h4>절감 가이드 요약</h4>
                <div className="quick-info-list">
                  {guides.length > 0 ? (
                    guides.map((guide, index) => (
                      <Link to="/guide" key={index} className="quick-info-item" onClick={() => handleGuideClick(index)}>
                        <span>{guide.action}</span>
                      </Link>
                    ))
                  ) : (<p className="no-info-text">절감 가이드가 없습니다.</p>)}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;