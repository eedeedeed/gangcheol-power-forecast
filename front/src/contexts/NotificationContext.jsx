import React, { createContext, useState, useCallback, useEffect } from 'react';

// 컨텍스트 기본값 정의
const defaultNotificationContext = {
    alerts: [],
    guides: [],
    realtimeAlerts: [],
    addRealtimeAlert: () => {},
    dismissRealtimeAlert: () => {},
    highlightedAlertId: null,
    setHighlightedAlertId: () => {},
    highlightedGuideId: null,
    setHighlightedGuideId: () => {},
    handleDismissAlert: () => {},
    handleDismissGuide: () => {},
    readAlertIds: new Set(),
    markAlertAsRead: () => {},
    handleDismissInCard: () => {},
    isModalOpen: false,
    selectedNotification: null,
    openNotificationModal: () => {},
    closeNotificationModal: () => {},
};

export const NotificationContext = createContext(defaultNotificationContext);

const tempAlerts = [
    { id: 10, type: "info", title: "에너지 절약 모드 활성화", time: "08/25 (월) 22:00", message: "업무 종료 시간에 따라 건물이 에너지 절약 모드로 전환되었습니다." },
    { id: 9, type: "warning", title: "B동 승강기 전력 급증", time: "08/25 (월) 16:45", message: "B동 2호기 승강기의 순간 전력 사용량이 비정상적으로 높습니다. 점검이 필요합니다." },
    { id: 1, type: "warning", title: "피크 사용량 임박", time: "08/25 (월) 14:50", message: "본관의 전력 사용량이 10분 후 피크 예상치에 도달할 것으로 보입니다." },
    { id: 3, type: "warning", title: "냉방 시스템 과부하", time: "08/25 (월) 13:20", message: "신관 3층 냉방 시스템의 전력 사용량이 평소보다 20% 높습니다." },
    { id: 4, type: "info", title: "태양광 발전량 최대", time: "08/25 (월) 12:30", message: "현재 태양광 발전량이 최대치에 도달했습니다. ESS 충전이 진행됩니다." },
    { id: 7, type: "warning", title: "서버실 온도 경고", time: "08/25 (월) 10:10", message: "전산실의 온도가 설정된 임계치를 초과했습니다. 냉방 장치를 확인해주세요." },
    { id: 8, type: "info", title: "주간 절감량 보고", time: "08/25 (월) 09:00", message: "지난 주 대비 3%의 전력 사용량을 절감했습니다." },
    { id: 6, type: "info", title: "ESS 충전 완료", time: "08/25 (월) 04:50", message: "심야 경부하 시간 동안 ESS 충전이 100% 완료되었습니다." },
    { id: 2, type: "info", title: "월별 목표 달성", time: "08/25 (월)", message: "이번 달 전력 절감 목표를 5% 초과 달성했습니다. 잘 하셨습니다!" },
    { id: 5, type: "warning", title: "주말 전력 사용량 높음", time: "08/23 (토) 11:00", message: "주말 비업무 시간임에도 불구하고 전력 사용량이 높게 유지되고 있습니다." }
];
const tempGuides = [
    { action: "불필요한 조명 소등", expected_saving: "50 kWh", description: "점심시간, 퇴근 후 등 사용하지 않는 공간의 조명은 반드시 소등하세요." },
    { action: "적정 실내 온도 유지", expected_saving: "80 kWh", description: "하절기 26℃, 동절기 20℃로 냉난방 온도를 설정하여 에너지를 절약하세요." },
    { action: "사무기기 대기전력 차단", expected_saving: "30 kWh", description: "퇴근 시 멀티탭을 끄거나 플러그를 뽑아 대기전력을 완벽히 차단하세요." },
    { action: "창문 및 출입문 관리", expected_saving: "60 kWh", description: "냉난방 시 창문과 출입문을 꼭 닫아 냉기 및 온기 손실을 최소화하세요." },
    { action: "엘리베이터 격층 운행", expected_saving: "25 kWh", description: "출퇴근 시간을 제외하고 엘리베이터를 격층 운행하여 전력을 절감할 수 있습니다." },
    { action: "PC 절전 모드 활용", expected_saving: "20 kWh", description: "30분 이상 자리를 비울 경우, PC를 절전 모드로 설정하는 것을 권장합니다." },
    { action: "LED 조명으로 교체", expected_saving: "120 kWh", description: "형광등을 고효율 LED 조명으로 교체하면 조명 전력의 50% 이상을 절감할 수 있습니다." },
    { action: "냉장고 설정 최적화", expected_saving: "15 kWh", description: "구내식당 및 탕비실 냉장고의 설정 온도를 적정 수준으로 유지하고, 문을 자주 여닫지 마세요." },
    { action: "외벽 및 창문 단열 강화", expected_saving: "150 kWh", description: "단열 필름을 부착하거나 외벽 단열을 보강하여 냉난방 효율을 극대화할 수 있습니다." },
    { action: "피크 시간대 장비 사용 자제", expected_saving: "90 kWh", description: "전력 사용량이 많은 장비는 최대 부하 시간대(14~16시)를 피해 사용하세요." }
];

export default function NotificationProvider({ children }) {
    // ✅ [수정] 초기 데이터에 itemType: 'alert'를 추가
    const [alerts, setAlerts] = useState(() => 
        tempAlerts.map(alert => ({ ...alert, itemType: 'alert' }))
    );
    const [guides, setGuides] = useState(tempGuides);
    const [realtimeAlerts, setRealtimeAlerts] = useState([]);
    const [highlightedAlertId, setHighlightedAlertId] = useState(null);
    const [highlightedGuideId, setHighlightedGuideId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const [readAlertIds, setReadAlertIds] = useState(() => {
        const saved = localStorage.getItem('readAlertIds');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        localStorage.setItem('readAlertIds', JSON.stringify([...readAlertIds]));
    }, [readAlertIds]);

    const markAlertAsRead = useCallback((alertId) => {
        setReadAlertIds(prev => new Set(prev).add(alertId));
    }, []);

    const addRealtimeAlert = useCallback((newAlertData) => {
        const newAlert = {
            ...newAlertData,
            id: newAlertData.id || Date.now(),
            type: 'warning',
            itemType: 'alert', // 실시간 알림에는 이미 포함되어 있음
        };
        setAlerts(prev => [newAlert, ...prev]);
        setRealtimeAlerts(prev => [...prev, newAlert]);
    }, []);

    const dismissRealtimeAlert = useCallback((alertId) => {
        setRealtimeAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const handleDismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const handleDismissInCard = useCallback((alertIdToDismiss) => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertIdToDismiss));
    }, []);

    const handleDismissGuide = useCallback((guideIndex) => {
        setGuides(prev => prev.filter((_, index) => index !== guideIndex));
    }, []);

    const openNotificationModal = useCallback((notification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
        if (notification.itemType === 'alert') {
            markAlertAsRead(notification.id);
        }
    }, [markAlertAsRead]);

    const closeNotificationModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedNotification(null);
    }, []);

    const value = {
        alerts,
        guides,
        realtimeAlerts,
        addRealtimeAlert,
        dismissRealtimeAlert,
        highlightedAlertId,
        setHighlightedAlertId,
        highlightedGuideId,
        setHighlightedGuideId,
        handleDismissAlert,
        handleDismissGuide,
        readAlertIds,
        markAlertAsRead,
        handleDismissInCard,
        isModalOpen,
        selectedNotification,
        openNotificationModal,
        closeNotificationModal,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}