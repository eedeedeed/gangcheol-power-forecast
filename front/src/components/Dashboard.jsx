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

function Dashboard({ currentPower, todayUsage, tomorrowPrediction, stats, selectedBuildingData }) {
  // props:
  // - currentPower: 현재 전력 사용량 정보 (usage, percentage, capacity)
  // - todayUsage: 오늘 시간별 전력 사용량 데이터 (Line Chart용)
  // - tomorrowPrediction: 내일 전력 사용량 예측 데이터 (현재 사용되지 않음)
  // - stats: 피크 예측, 절감률, 월별 비용, 절약 비용 등 주요 통계 데이터
  // - selectedBuildingData: 현재 선택된 건물에 대한 상세 데이터 (App.jsx에서 전달)

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
        borderColor: ['transparent', 'transparent'], // 테두리 없음
        borderWidth: 0, // 테두리 두께 0
        cutout: '80%', // 도넛 차트의 중앙 구멍 크기
        circumference: 360, // 차트가 전체 원형이 되도록 설정 (기본값)
        rotation: 0, // 차트 시작 각도 (기본값)
      },
    ],
  });

  // `currentPower.percentage` prop이 변경될 때마다 게이지 차트 데이터를 업데이트합니다.
  // App.jsx에서 currentPower가 업데이트되면 이 useEffect가 실행되어 차트가 다시 그려집니다.
  useEffect(() => {
    setRealtimeGaugeChartData({
      labels: ['사용량', '남은 용량'],
      datasets: [
        {
          data: [currentPower.percentage, 100 - currentPower.percentage],
          backgroundColor: ['rgba(50, 184, 198, 1)', '#3A3A3A'],
          borderColor: ['transparent', 'transparent'],
          borderWidth: 0,
          cutout: '80%',
          circumference: 360,
          rotation: 0,
        },
      ],
    });
  }, [currentPower.percentage]); // currentPower.percentage가 의존성 배열에 포함되어 변경 시 재실행

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

  return (
    // 대시보드 페이지의 최상위 컨테이너입니다.
    <div id="dashboard">

      {/* 주요 통계 카드들을 담는 그리드 컨테이너입니다. */}
      <div className="stats-grid">
        {/* 현재 사용량 카드 */}
        <div className="stat-card">
          <div className="stat-header">
            <h4>현재 사용량</h4>
            {/* 선택된 건물의 상태에 따라 '정상' 또는 '주의'를 표시합니다. */}
            <span className={`status ${selectedBuildingData.status === 'normal' ? 'status--info' : 'status--warning'}`}>
              {selectedBuildingData.status === 'normal' ? '정상' : '주의'}
            </span>
          </div>
          <div className="stat-body">
            {/* 현재 전력 사용량을 로케일 형식으로 포맷팅하여 표시합니다. */}
            <p className="current-usage-value">{currentPower.usage.toLocaleString()} kW</p>
            {/* 용량 대비 현재 사용량의 퍼센트를 표시합니다. */}
            <p className="current-usage-percentage">용량의 {currentPower.percentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* 예상 피크 카드 */}
        <div className="stat-card">
          <div className="stat-header">
            <h4>예상 피크</h4>
            {/* 예상 피크 상태에 따라 '주의' 또는 '정상'을 표시합니다. */}
            <span className={`status status--${stats.peak_prediction.status}`}>
              {stats.peak_prediction.status === 'warning' ? '주의' : '정상'}
            </span>
          </div>
          <div className="stat-body">
            {/* 예상 피크 사용량을 로케일 형식으로 포맷팅하여 표시합니다. */}
            <p className="peak-usage-value">{stats.peak_prediction.usage.toLocaleString()} kW</p>
            {/* 예상 피크 발생 시간을 표시합니다. */}
            <p className="peak-time">내일 {stats.peak_prediction.time}</p>
          </div>
        </div>

        {/* 예상 사용량 카드 (새로 추가된 카드) */}
        <div className="stat-card">
          <div className="stat-header">
            <h4>예상 사용량</h4>
            <span className="status status--info">정보</span> {/* 임의의 상태값으로 '정보' 표시 */}
          </div>
          <div className="stat-body">
            <p className="current-usage-value">1,750 kW</p> {/* 임의의 예상 사용량 값 */}
            <p className="current-usage-percentage">내일 평균</p>
          </div>
        </div>

        {/* 절감률 카드 */}
        <div className="stat-card">
          <div className="stat-header">
            <h4>절감률</h4>
            {/* 절감률 상태에 따라 '우수' 또는 '보통'을 표시합니다. */}
            <span className={`status status--${stats.savings_rate_status}`}>
              {stats.savings_rate_status === 'success' ? '우수' : '보통'}
            </span>
          </div>
          <div className="stat-body">
            {/* 절감률을 소수점 첫째 자리까지 표시합니다. */}
            <p className="savings-rate-value">{stats.savings_rate.toFixed(1)}%</p>
            <p className="savings-rate-description">전월 대비</p>
          </div>
        </div>

        {/* 절약 비용 카드 */}
        <div className="stat-card">
          <div className="stat-header">
            <h4>절약 비용</h4>
            {/* 절약 비용 상태에 따라 '달성' 또는 '목표'를 표시합니다. */}
            <span className={`status status--${stats.cost_saved_status}`}>
              {stats.cost_saved_status === 'success' ? '달성' : '목표'}
            </span>
          </div>
          <div className="stat-body">
            {/* 절약 비용을 로케일 형식으로 포맷팅하여 표시합니다. */}
            <p className="cost-saved-value">{stats.cost_saved.toLocaleString()}원</p>
            <p className="cost-saved-description">이번 달</p>
          </div>
        </div>
      </div>

      {/* 차트들을 담는 그리드 컨테이너입니다. */}
      <div className="charts-grid">
        {/* 실시간 전력 사용량 게이지 차트 카드 */}
        <div className="card chart-card">
          <div className="card__header">
            <h4>실시간 전력 사용량 <span className="chart-title-indicator"></span></h4> {/* 차트 제목 옆 인디케이터 */}
          </div>
          {/* 차트 본문입니다. 게이지 차트와 텍스트를 중앙에 배치합니다. */}
          <div className="card__body" style={{position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {/* 게이지 차트 컨테이너입니다. */}
            <div className="power-gauge-large">
              {/* Doughnut 차트 컴포넌트입니다. `realtimeGaugeChartData`와 옵션을 전달합니다. */}
              <Doughnut data={realtimeGaugeChartData} options={{
                animation: false, // 애니메이션 비활성화
                transitions: { active: { animation: { duration: 0 } } }, // 전환 애니메이션 비활성화
                hover: { animationDuration: 0 }, // 호버 애니메이션 비활성화
                responsiveAnimationDuration: 0, // 반응형 애니메이션 비활성화
                responsive: true, // 반응형 활성화
                maintainAspectRatio: false, // 종횡비 유지 비활성화
                cutout: '80%', // 도넛 차트의 두께
                circumference: 360, // 전체 원형
                rotation: 0, // 0도에서 시작
                plugins: {
                  legend: { display: false }, // 범례 숨기기
                  tooltip: { enabled: false } // 툴팁 숨기기
                },
              }} />
              {/* 게이지 차트 중앙에 표시될 텍스트 (퍼센트)입니다. */}
              <div className="power-gauge-text-large">
                <span id="usagePercentageLarge">{currentPower.percentage.toFixed(1)}%</span> {/* 현재 사용량 퍼센트 표시 */}
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 전력 사용량 추이 라인 차트 카드 */}
        <div className="card chart-card">
          <div className="card__header">
            <h4>오늘의 전력 사용량 추이</h4>
            <span className="chart-subtitle">시간별 사용량 (kW)</span>
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
