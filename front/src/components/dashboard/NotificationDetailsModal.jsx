import React from 'react';

function NotificationDetailsModal({ isOpen, onClose, notification }) {
  if (!isOpen || !notification) {
    return null;
  }

  return (
    // 🔥 [수정] 클래스 이름을 'modal-overlay'에서 'modal-backdrop'으로 변경
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{notification.title || '알림 상세 정보'}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <p>{notification.message || '내용이 없습니다.'}</p>
          {notification.time && <small>{notification.time}</small>}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn--primary">닫기</button>
        </div>
      </div>
    </div>
  );
}

export default NotificationDetailsModal;