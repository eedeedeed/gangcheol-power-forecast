import React from 'react';

// ✅ [제거] AlertIcon SVG 컴포넌트를 삭제했습니다.

/**
 * react-toastify 내부에 렌더링될 커스텀 알림 컴포넌트입니다.
 * @param {object} props - closeToast (toast 닫기 함수), alert (알림 데이터 객체), onAlertClick (알림 클릭 핸들러)
 */
function ToastAlert({ closeToast, alert, onAlertClick }) {
  const handleClick = () => {
    onAlertClick(alert); // 클릭된 알림 객체를 전달하여 모달을 엽니다.
    closeToast();        // 팝업 닫기
  };

  return (
    // ✅ [수정] 아이콘 div를 삭제하고 클래스 이름을 조정
    <div className="toast-alert-card no-icon" onClick={handleClick}>
      <div className="toast-alert-content">
        <h5 className="toast-alert-title">{alert.title}</h5>
        <p className="toast-alert-message">{alert.message}</p>
        <span className="toast-alert-time">{alert.time}</span>
      </div>
    </div>
  );
}

export default ToastAlert;