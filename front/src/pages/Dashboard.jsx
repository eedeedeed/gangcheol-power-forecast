import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

import StatCard from '../components/dashboard/StatCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import NotificationCard from '../components/dashboard/NotificationCard';
import { BuildingContext } from '../contexts/BuildingContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { startReplayStream } from '../api/replay.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const ResponsiveGridLayout = WidthProvider(Responsive);

const initialLayouts = {
  lg: [
    { i: 'stat-current', x: 0, y: 0, w: 5, h: 1.5, minW: 1, minH: 1 },
    { i: 'stat-peak', x: 5, y: 0, w: 5, h: 1.5, minW: 1, minH: 1 },
    { i: 'stat-prediction', x: 10, y: 0, w: 5, h: 1.5, minW: 1, minH: 1 },
    { i: 'comparison-card', x: 0, y: 1.5, w: 5, h: 1.5, minW: 1, minH: 1 },
    { i: 'current-time', x: 5, y: 1.5, w: 5, h: 1.5, minW: 1, minH: 1 },
    { i: 'weather', x: 10, y: 1.5, w: 5, h: 3, minW: 1, minH: 1 },
    { i: 'line-chart', x: 0, y: 4.5, w: 11, h: 4, minW: 1, minH: 1 },
    { i: 'notifications-panel', x: 11, y: 4.5, w: 4, h: 4, minW: 1, minH: 1 },
  ]
};

const initialLiveData = {
  ts: "", actual_kwh: 0, predicted_kwh: 0,
  peak: { is_peak: 0, prob: 0 },
};

const initialLineChartData = {
  labels: [],
  datasets: [
    {
      label: '실측 사용량 (kWh)',
      data: [],
      borderColor: '#32b8c6',
      backgroundColor: 'rgba(50, 184, 198, 0.15)',
      fill: true,
      tension: 0.3
    },
    {
      label: '일주일 전 사용량 (kWh)',
      data: [],
      borderColor: 'rgba(150, 150, 150, 0.7)',
      backgroundColor: 'rgba(150, 150, 150, 0.05)',
      fill: false,
      tension: 0.3,
      borderDash: [5, 5]
    }
  ]
};

const initialComparisonData = {
  daily: { kwh: null, changePercent: '수집 중...', isIncrease: null },
  weekly: { kwh: null, changePercent: '수집 중...', isIncrease: null, dayOfWeek: '' },
};


function Dashboard() {
  const { isEditMode, handleEditModeToggle } = useOutletContext();
  const { selectedBuilding, selectedBuildingId } = useContext(BuildingContext);
  const { alerts, guides, addRealtimeAlert, openNotificationModal } = useContext(NotificationContext);

  const [layouts, setLayouts] = useState(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    return savedLayouts ? JSON.parse(savedLayouts) : initialLayouts;
  });

  const [originalLayouts, setOriginalLayouts] = useState(null);
  const onLayoutChange = (layout, newLayouts) => {
    if (isEditMode) setLayouts(newLayouts);
  };

  const [liveData, setLiveData] = useState(initialLiveData);
  const [lineChartData, setLineChartData] = useState(initialLineChartData);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [comparisonData, setComparisonData] = useState(initialComparisonData);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      setLiveData(initialLiveData);
      setLineChartData(initialLineChartData);
      setComparisonData(initialComparisonData);
    }
  }, [selectedBuildingId]);

  useEffect(() => {
    const buildingIdToStream = selectedBuildingId;
    if (!buildingIdToStream) return;

    const handleTick = (payload) => {
      console.log('[SSE] 실시간 전력 데이터:', payload);
      setLiveData(payload);

      // ✅ [수정] 삭제되었던 그래프 업데이트 로직 복원
      if (payload.actual_kwh !== undefined) {
        setLineChartData(prevData => {
          const dataTimestampUTC = new Date(payload.ts.replace(' ', 'T') + 'Z');
          const newLabel = `${String(dataTimestampUTC.getUTCHours()).padStart(2, '0')}:${String(dataTimestampUTC.getUTCMinutes()).padStart(2, '0')}`;

          if (prevData.labels.length > 0 && prevData.labels[prevData.labels.length - 1] === newLabel) {
              return prevData;
          }

          const newLabels = [...prevData.labels, newLabel].slice(-24);
          const newActualData = [...prevData.datasets[0].data, payload.actual_kwh].slice(-24);

          const storageKey = `historicalData_${buildingIdToStream}`;
          const historicalData = JSON.parse(localStorage.getItem(storageKey)) || {};
          const sevenDaysAgoTimestampUTC = new Date(dataTimestampUTC);
          sevenDaysAgoTimestampUTC.setUTCDate(sevenDaysAgoTimestampUTC.getUTCDate() - 7);
          const weeklyKey = `${sevenDaysAgoTimestampUTC.getUTCFullYear()}-${String(sevenDaysAgoTimestampUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgoTimestampUTC.getUTCDate()).padStart(2, '0')} ${String(sevenDaysAgoTimestampUTC.getUTCHours()).padStart(2, '0')}`;
          const weeklyValue = historicalData[weeklyKey] || null;
          const newWeeklyData = [...prevData.datasets[1].data, weeklyValue].slice(-24);

          return {
            labels: newLabels,
            datasets: [
                { ...prevData.datasets[0], data: newActualData },
                { ...prevData.datasets[1], data: newWeeklyData },
            ]
          };
        });
      }

      try {
        const storageKey = `historicalData_${buildingIdToStream}`;
        const historicalData = JSON.parse(localStorage.getItem(storageKey)) || {};
        
        const dataTimestampUTC = new Date(payload.ts.replace(' ', 'T') + 'Z');
        const dataKey = `${dataTimestampUTC.getUTCFullYear()}-${String(dataTimestampUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(dataTimestampUTC.getUTCDate()).padStart(2, '0')} ${String(dataTimestampUTC.getUTCHours()).padStart(2, '0')}`;
        
        if (payload.actual_kwh !== undefined) {
          historicalData[dataKey] = payload.actual_kwh;
        }

        const latestDataTime = dataTimestampUTC.getTime();
        const eightDaysAgo = latestDataTime - (8 * 24 * 60 * 60 * 1000);
        
        for (const key in historicalData) {
            const keyDateUTC = new Date(key.replace(' ', 'T') + ':00:00Z');
            if (keyDateUTC.getTime() < eightDaysAgo) {
                delete historicalData[key];
            }
        }
        
        localStorage.setItem(storageKey, JSON.stringify(historicalData));
      } catch (error) {
        console.error('localStorage 저장 오류:', error);
      }
    };
    
    const stream = startReplayStream(buildingIdToStream, {
      onTick: handleTick,
      onError: (error) => console.error('[SSE] 스트림 오류:', error),
    });

    return () => {
      if (stream) stream.close();
    };
  }, [selectedBuildingId]);

  useEffect(() => {
    if (!liveData.ts || !selectedBuildingId) return;

    const storageKey = `historicalData_${selectedBuildingId}`;
    const historicalData = JSON.parse(localStorage.getItem(storageKey)) || {};
    const currentKwh = liveData.actual_kwh;
    
    const newComparisonData = { ...initialComparisonData };
    const currentTimestampUTC = new Date(liveData.ts.replace(' ', 'T') + 'Z');
    
    const yesterdayTimestampUTC = new Date(currentTimestampUTC);
    yesterdayTimestampUTC.setUTCHours(yesterdayTimestampUTC.getUTCHours() - 24);
    const yesterdayKey = `${yesterdayTimestampUTC.getUTCFullYear()}-${String(yesterdayTimestampUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterdayTimestampUTC.getUTCDate()).padStart(2, '0')} ${String(yesterdayTimestampUTC.getUTCHours()).padStart(2, '0')}`;
    const yesterdayKwh = historicalData[yesterdayKey];

    if (yesterdayKwh !== undefined && yesterdayKwh !== null) {
      if (yesterdayKwh > 0 && currentKwh !== undefined) {
        const change = ((currentKwh - yesterdayKwh) / yesterdayKwh) * 100;
        newComparisonData.daily = { kwh: yesterdayKwh, changePercent: `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`, isIncrease: change >= 0, };
      }
    }

    const sevenDaysAgoTimestampUTC = new Date(currentTimestampUTC);
    sevenDaysAgoTimestampUTC.setUTCDate(sevenDaysAgoTimestampUTC.getUTCDate() - 7);
    const weeklyKey = `${sevenDaysAgoTimestampUTC.getUTCFullYear()}-${String(sevenDaysAgoTimestampUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgoTimestampUTC.getUTCDate()).padStart(2, '0')} ${String(sevenDaysAgoTimestampUTC.getUTCHours()).padStart(2, '0')}`;
    const weeklyKwh = historicalData[weeklyKey];
    const dayOfWeek = sevenDaysAgoTimestampUTC.toLocaleDateString('ko-KR', { weekday: 'short' });

    if (weeklyKwh !== undefined && weeklyKwh !== null) {
      if (weeklyKwh > 0 && currentKwh !== undefined) {
        const change = ((currentKwh - weeklyKwh) / weeklyKwh) * 100;
        newComparisonData.weekly = { kwh: weeklyKwh, changePercent: `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`, isIncrease: change >= 0, dayOfWeek: dayOfWeek, };
      }
    } else {
        newComparisonData.weekly.dayOfWeek = dayOfWeek;
    }
    setComparisonData(newComparisonData);

  }, [liveData, selectedBuildingId]);

  const prevPeakStateRef = useRef(false);
  const lastAlertTimestampRef = useRef(0);

  useEffect(() => {
    const currentIsPeak = liveData.peak?.is_peak === 1;
    const now = Date.now();
    const COOLDOWN_PERIOD = 5 * 60 * 1000;

    if (currentIsPeak && !prevPeakStateRef.current && (now - lastAlertTimestampRef.current > COOLDOWN_PERIOD)) {
        addRealtimeAlert({
            id: `peak-${now}`,
            title: `⚠️ [주의] 곧 전력 피크가 예상됩니다!`,
            message: `예측 사용량이 임계치를 초과할 가능성이 높습니다. 냉방/조명 부하 조절을 검토하세요.`,
            time: new Date(liveData.ts).toLocaleString('ko-KR'),
        });
        lastAlertTimestampRef.current = now;
    }
    prevPeakStateRef.current = currentIsPeak;
  }, [liveData, addRealtimeAlert, selectedBuilding]);
  
  const handleConfirmEdit = useCallback(() => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    handleEditModeToggle();
  }, [layouts, handleEditModeToggle]);

  const handleCancelEdit = useCallback(() => {
    if (originalLayouts) {
      setLayouts(originalLayouts);
    }
    handleEditModeToggle();
  }, [originalLayouts, handleEditModeToggle]);
  
  const handleResetLayout = () => {
      if (window.confirm("정말로 레이아웃을 초기 상태로 되돌리시겠습니까?")) {
        setLayouts(initialLayouts);
        localStorage.removeItem('dashboard-layouts');
        alert("레이아웃이 초기화되었습니다.");
      }
  };

  const chartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: true, position: 'top' } },
    animation: false,
  };
  const formatTime = (date) => date.toLocaleTimeString('ko-KR', { hour12: false });
  const formatDate = (date) => {
    const dateString = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).slice(0, -1);
    const dayString = date.toLocaleDateString('ko-KR', { weekday: 'short' });
    return `${dateString} (${dayString})`;
  };

  const dailyValueClass = comparisonData.daily.isIncrease === null ? '' : (comparisonData.daily.isIncrease ? 'increase' : 'decrease');
  const weeklyValueClass = comparisonData.weekly.isIncrease === null ? '' : (comparisonData.weekly.isIncrease ? 'increase' : 'decrease');

  return (
    <div id="dashboard">
      <ResponsiveGridLayout
        className={`layout ${isEditMode ? 'edit-mode' : ''}`}
        layouts={layouts}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 15 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        compactType="vertical"
        isDraggable={isEditMode}
        isResizable={isEditMode}
      >
        <div key="weather" className="card"><WeatherCard /></div>
        <div key="stat-current" className="card"><StatCard title="현재 사용량 (실측)" value={`${(liveData.actual_kwh || 0).toFixed(2)} kWh`} status={liveData.peak?.is_peak ? 'warning' : 'normal'} statusText={liveData.peak?.is_peak ? '피크' : '정상'}/></div>
        <div key="stat-peak" className="card"><StatCard title="피크 발생 확률" value={`${((liveData.peak?.prob || 0) * 100).toFixed(1)} %`} status={liveData.peak?.is_peak ? 'warning' : 'normal'} statusText={liveData.peak?.is_peak ? '주의' : '안정'} cardClass="peak-probability-card" /></div>
        <div key="stat-prediction" className="card"><StatCard title="예상 사용량 (1시간 후)" value={`${(liveData.predicted_kwh || 0).toFixed(2)} kWh`} status="info" statusText="정보"/></div>
        
        <div key="comparison-card" className="card no-padding">
          <div className="comparison-card-split">
            <div className="comparison-half">
              <div className="comparison-label">전일 대비</div>
              <div className={`comparison-value ${dailyValueClass}`}>{comparisonData.daily.changePercent}</div>
              <div className="comparison-description">{comparisonData.daily.kwh ? `어제: ${comparisonData.daily.kwh.toFixed(1)} kWh` : ' '}</div>
            </div>
            <div className="comparison-half">
              <div className="comparison-label">{`주간 대비 (${comparisonData.weekly.dayOfWeek || '요일'})`}</div>
              <div className={`comparison-value ${weeklyValueClass}`}>{comparisonData.weekly.changePercent}</div>
              <div className="comparison-description">{comparisonData.weekly.kwh ? `지난주: ${comparisonData.weekly.kwh.toFixed(1)} kWh` : ' '}</div>
            </div>
          </div>
        </div>

        <div key="current-time" className="card">
          <StatCard
            title={formatDate(currentTime)}
            value={formatTime(currentTime)}
            isTimeCard={true}
          />
        </div>
        <div key="line-chart" className="card chart-card">
          <div className="card__header">
            <h4>실시간 전력 사용량 추이</h4>
          </div>
          <div className="card__body">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
        <div key="notifications-panel" className="card no-padding">
           <PanelGroup direction="vertical">
            <Panel defaultSize={50} minSize={20}>
              <div className="notification-panel-section">
                <div className="card__header"><h4>알림</h4></div>
                <div className="card__body scrollable-body">
                  <NotificationCard alerts={alerts} guides={[]} onNotificationClick={openNotificationModal} />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="resizable-handle" />
            <Panel defaultSize={50} minSize={20}>
              <div className="notification-panel-section">
                <div className="card__header"><h4>가이드</h4></div>
                <div className="card__body scrollable-body">
                  <NotificationCard alerts={[]} guides={guides} onNotificationClick={openNotificationModal} />
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </ResponsiveGridLayout>
      {isEditMode && (
         <div className="dashboard-edit-confirm-modal">
         <p>대시보드 레이아웃 편집</p>
         <div className="modal-actions">
           <button className="btn btn-warning" onClick={handleResetLayout}>초기화</button>
           <button className="btn btn--primary" onClick={handleConfirmEdit}>확인</button>
           <button className="btn btn--secondary" onClick={handleCancelEdit}>취소</button>
         </div>
       </div>
      )}
    </div>
  );
}

export default Dashboard;