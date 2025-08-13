// src/pages/Guide.jsx
import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

function Guide() {
  // NotificationContext에서 데이터를 가져오는 로직은 그대로 유지합니다.
  const { guides, highlightedGuideId, setHighlightedGuideId, handleDismissGuide } = useContext(NotificationContext);

  // 하이라이트 효과 로직도 그대로 유지합니다.
  useEffect(() => {
    if (highlightedGuideId !== null) {
      const timer = setTimeout(() => {
        setHighlightedGuideId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightedGuideId, setHighlightedGuideId]);

  return (
    <div id="guide">
      <div className="guide-container">
        {guides.length > 0 ? guides.map((guide, index) => (
          <div key={index} className={`guide-card ${index === highlightedGuideId ? 'blink' : ''}`}>
            {/* === 👇 여기부터 구조가 변경됩니다 === */}
            <div className="guide-header">
              <div className="guide-title">{guide.action}</div>
              <div className="guide-meta">
                <div className="guide-saving-info">{guide.expected_saving} 절감</div>
                {/* '알림'과 동일한 닫기 버튼을 사용합니다. */}
                <button onClick={() => handleDismissGuide(index)} className="card-close-btn">&times;</button>
              </div>
            </div>
            <div className="guide-description">{guide.description}</div>
            {/* === 👆 여기까지 구조가 변경됩니다 === */}
          </div>
        )) : <p>표시할 절감 가이드가 없습니다.</p>}
      </div>
    </div>
  );
}

export default Guide;