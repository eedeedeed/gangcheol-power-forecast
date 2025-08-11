import React, { createContext, useState, useCallback } from 'react';

// 컨텍스트 기본값 정의
const defaultNotificationContext = {
    alerts: [],
    guides: [],
    highlightedAlertId: null,
    setHighlightedAlertId: () => {},
    highlightedGuideId: null,
    setHighlightedGuideId: () => {},
    handleDismissAlert: () => {},
    handleDismissGuide: () => {},
};

export const NotificationContext = createContext(defaultNotificationContext);

const tempAlerts = [
    { id: 1, type: "warning", title: "피크 사용량 임박", time: "15:00", message: "본관의 전력 사용량이 피크 예상치에 근접하고 있습니다." },
    { id: 2, type: "info", title: "월별 목표 달성", time: "08/09", message: "이번 달 전력 절감 목표를 초과 달성했습니다." }
];
const tempGuides = [
    { action: "불필요한 조명 소등", expected_saving: "50 kWh", description: "사용하지 않는 공간의 조명을 끄세요." },
    { action: "적정 실내 온도 유지", expected_saving: "80 kWh", description: "냉난방 온도를 1도씩만 조절해도 큰 차이를 만듭니다." }
];

// Provider 함수를 'default export'로 내보냅니다.
export default function NotificationProvider({ children }) {
    const [alerts, setAlerts] = useState(tempAlerts);
    const [guides, setGuides] = useState(tempGuides);
    const [highlightedAlertId, setHighlightedAlertId] = useState(null);
    const [highlightedGuideId, setHighlightedGuideId] = useState(null);

    const handleDismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const handleDismissGuide = useCallback((guideIndex) => {
        setGuides(prev => prev.filter((_, index) => index !== guideIndex));
    }, []);

    const value = {
        alerts,
        guides,
        highlightedAlertId,
        setHighlightedAlertId,
        highlightedGuideId,
        setHighlightedGuideId,
        handleDismissAlert,
        handleDismissGuide,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}