import React, { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';

function NotificationCard({ alerts, guides, onNotificationClick }) {
    const { 
        readAlertIds,
        handleDismissInCard 
    } = useContext(NotificationContext);

    const handleDismissClick = (e, alertId) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        handleDismissInCard(alertId);
    };

    // alerts나 guides 중 하나만 렌더링하도록 로직 단순화
    const itemsToRender = alerts.length > 0 ? alerts : guides;
    const itemType = alerts.length > 0 ? 'alert' : 'guide';

    return (
        <div className="notification-card-content">
            <div className="notification-list-container">
                {itemsToRender.length > 0 ? (
                    itemsToRender.map((item) => {
                        if (itemType === 'alert') {
                            const isUnread = !readAlertIds.has(item.id);
                            return (
                                <div key={item.id} className={`notification-list-item ${isUnread ? 'unread' : ''}`} onClick={() => onNotificationClick(item)}>
                                    <button 
                                        className="btn-dismiss-notification" 
                                        onClick={(e) => handleDismissClick(e, item.id)}
                                    >
                                        &times;
                                    </button>
                                    <div className="item-header">
                                        <span className={`item-type-badge ${item.type}`}>{item.type === 'warning' ? '경고' : '정보'}</span>
                                        <span className="item-title">{item.title}</span>
                                    </div>
                                    <div className="item-time">{item.time}</div>
                                </div>
                            );
                        } else { // itemType === 'guide'
                            return (
                                <div key={item.id || item.action} className="notification-list-item" onClick={() => onNotificationClick(item)}>
                                    <div className="item-header">
                                        <span className="item-type-badge guide">가이드</span>
                                        <span className="item-title">{item.action}</span>
                                    </div>
                                </div>
                            );
                        }
                    })
                ) : (
                    <p className="no-info-text">내용이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default NotificationCard;