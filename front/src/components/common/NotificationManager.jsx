import React, { useContext, useEffect, useRef } from 'react';
import { toast, Slide } from 'react-toastify';
import { NotificationContext } from '../../contexts/NotificationContext';
import { ThemeContext } from '../../contexts/ThemeContext'; // ThemeContext import
import ToastAlert from './ToastAlert';

function NotificationManager() {
  const { realtimeAlerts, dismissRealtimeAlert, openNotificationModal } = useContext(NotificationContext);
  const { theme } = useContext(ThemeContext); // theme 상태 가져오기
  const activeToastIds = useRef(new Set()); // 활성화된 토스트 ID를 추적하기 위한 ref

  // 테마가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    // 현재 활성화된 모든 토스트의 테마를 업데이트합니다.
    activeToastIds.current.forEach(toastId => {
      toast.update(toastId, { theme: theme });
    });
  }, [theme]); // theme이 변경될 때만 이 effect를 실행합니다.

  useEffect(() => {
    if (Array.isArray(realtimeAlerts)) {
      realtimeAlerts.forEach(alert => {
        if (!toast.isActive(alert.id)) {
          const toastId = toast(
            ({ closeToast }) => (
              <ToastAlert
                alert={alert}
                closeToast={closeToast}
                onAlertClick={openNotificationModal}
              />
            ),
            {
              toastId: alert.id,
              onOpen: () => activeToastIds.current.add(alert.id), // 토스트가 열릴 때 Set에 ID 추가
              onClose: () => {
                dismissRealtimeAlert(alert.id);
                activeToastIds.current.delete(alert.id); // 토스트가 닫힐 때 Set에서 ID 제거
              },
              position: "bottom-right",
              autoClose: false,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              className: 'custom-toast',
              transition: Slide,
              theme: theme, // 생성 시점의 현재 테마를 적용
            }
          );
        }
      });
    }
  }, [realtimeAlerts, dismissRealtimeAlert, openNotificationModal, theme]);

  return null;
}

export default NotificationManager;