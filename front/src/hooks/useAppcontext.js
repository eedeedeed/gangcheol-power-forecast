// src/hooks/useAppContext.js
import { useState, useEffect, useCallback } from 'react';
import * as api from '../service/api';
import * as authApi from '../service/authApi';

// App의 모든 상태와 로직을 관리하는 커스텀 훅
export default function useAppContext() {
  // --- 상태 선언부 ---
  const [activeTab, setActiveTab] = useState('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [powerData, setPowerData] = useState(api.getInitialPowerData());
  const [buildings, setBuildings] = useState(powerData.buildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  const [quickAlerts, setQuickAlerts] = useState(powerData.alerts);
  const [savingsGuides, setSavingsGuides] = useState(powerData.savings_guide);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [highlightedAlertId, setHighlightedAlertId] = useState(null);
  const [highlightedGuideId, setHighlightedGuideId] = useState(null); // 가이드 점멸 효과를 위한 상태
  const [usageHistory, setUsageHistory] = useState([]);
  const [displayInterval, setDisplayInterval] = useState('realtime');
  const [displayedUsage, setDisplayedUsage] = useState(0);
  const [displayedPercentage, setDisplayedPercentage] = useState(0);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  });

  // --- 로직 및 이펙트 ---

  // 테마 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    if (!isLoggedIn) return;
    const SIMULATION_INTERVAL = 3000; // 3초
    const interval = setInterval(() => {
      const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
      if (!selectedBuilding) return;

      const fluctuation = (Math.random() - 0.5) * 20;
      const newUsage = Math.max(selectedBuilding.current + fluctuation, 0);
      
      const now = Date.now();
      setUsageHistory(prevHistory => {
        const newHistory = [...prevHistory, { timestamp: now, usage: newUsage }];
        const oneHourAgo = now - 60 * 60 * 1000;
        return newHistory.filter(item => item.timestamp >= oneHourAgo);
      });
    }, SIMULATION_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedBuildingId, isLoggedIn, buildings]);

  // 표시될 데이터 계산
  useEffect(() => {
    if (usageHistory.length === 0) {
      const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
      if (selectedBuilding) {
        setDisplayedUsage(Math.round(selectedBuilding.current));
        setDisplayedPercentage((selectedBuilding.current / powerData.current_power.capacity) * 100);
      }
      return;
    }

    let usageToShow = 0;
    const latestEntry = usageHistory[usageHistory.length - 1];

    if (displayInterval === 'realtime') {
      usageToShow = latestEntry.usage;
    } else {
      const now = Date.now();
      const intervalMinutes = parseInt(displayInterval.replace('min', ''));
      const startTime = now - intervalMinutes * 60 * 1000;
      const relevantHistory = usageHistory.filter(item => item.timestamp >= startTime);
      
      if (relevantHistory.length > 0) {
        const sum = relevantHistory.reduce((acc, item) => acc + item.usage, 0);
        usageToShow = sum / relevantHistory.length;
      } else {
        usageToShow = latestEntry.usage;
      }
    }
    
    setDisplayedUsage(Math.round(usageToShow));
    setDisplayedPercentage((usageToShow / powerData.current_power.capacity) * 100);
  }, [usageHistory, displayInterval, powerData.current_power.capacity, selectedBuildingId, buildings]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = () => setIsUserDropdownOpen(false);
    if (isUserDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  // --- 핸들러 함수 ---

  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'light' ? 'dark' : 'light')), []);
  const handleTabClick = useCallback((tabId) => {
    if (!isLoggedIn && tabId !== 'auth') {
      setActiveTab('auth');
      return;
    }
    setActiveTab(tabId);
    setIsUserDropdownOpen(false);
  }, [isLoggedIn]);

  const handleBuildingSelect = useCallback((e) => {
    setSelectedBuildingId(parseInt(e.target.value, 10));
    setDisplayInterval('realtime'); 
  }, []);

  const handleDismissAlert = useCallback((alertId) => {
    setQuickAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const handleDismissGuide = useCallback((guideIndex) => {
    setSavingsGuides(prev => prev.filter((_, index) => index !== guideIndex));
  }, []);
  const handleLoginSuccess = useCallback(() => { setIsLoggedIn(true); setActiveTab('dashboard'); }, []);
  const handleLogout = useCallback(() => { setIsLoggedIn(false); setActiveTab('auth'); setIsUserDropdownOpen(false); }, []);

  // 건물 등록 및 관리 핸들러
  const handleBuildingAdd = useCallback(async (newBuilding) => {
    try {
      // 1. API 함수를 호출하여 백엔드로 데이터를 전송합니다.
      const response = await authApi.buildingRegister(newBuilding);

      // 2. 백엔드에서 성공적으로 처리 후 반환된 데이터 (id 포함)를 받습니다.
      const registeredBuilding = response.data; 

      // 3. 서버 응답 데이터로 프론트엔드 상태를 업데이트합니다.
      setBuildings(prevBuildings => [...prevBuildings, registeredBuilding]);
      
      alert('건물이 성공적으로 등록되었습니다.');

    } catch (error) {
      // 4. 에러 발생 시 사용자에게 알립니다.
      console.error("건물 등록 실패:", error);
      alert('건물 등록에 실패했습니다. 다시 시도해주세요.');
    }
  }, []);

  const handleBuildingUpdate = useCallback((updatedBuilding) => {
    setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
  }, []);

  const handleBuildingDelete = useCallback((buildingId) => {
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
  }, []);
  
  const currentBuildingData = buildings.find(b => b.id === selectedBuildingId);

  // --- 내보낼 값 ---
  return {
    activeTab,
    isLoggedIn,
    powerData,
    currentUsage: displayedUsage,
    usagePercentage: displayedPercentage,
    selectedBuildingId,
    quickAlerts,
    savingsGuides,
    isUserDropdownOpen,
    currentBuildingData,
    buildings,
    highlightedAlertId,
    highlightedGuideId,
    theme,
    handleTabClick,
    handleBuildingSelect,
    handleDismissAlert,
    handleDismissGuide,
    handleLoginSuccess,
    handleLogout,
    setIsUserDropdownOpen,
    setActiveTab,
    setHighlightedAlertId,
    setHighlightedGuideId,
    handleBuildingAdd,
    handleBuildingUpdate,
    handleBuildingDelete,
    setDisplayInterval,
    toggleTheme,
  };
}