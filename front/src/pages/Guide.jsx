// src/pages/Guide.jsx
import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

function Guide() {
  // 이제 props 대신 NotificationContext에서 직접 데이터를 가져옵니다.
  const { guides, highlightedGuideId, setHighlightedGuideId, handleDismissGuide } = useContext(NotificationContext);

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
            <div className="guide-header">
              <div className="guide-action">{guide.action}</div>
              <div className="guide-meta">
                <div className="guide-saving">{guide.expected_saving} 절감</div>
                <button onClick={() => handleDismissGuide(index)} className="card-close-btn">&times;</button>
              </div>
            </div>
            <div className="guide-description">{guide.description}</div>
          </div>
        )) : <p>표시할 절감 가이드가 없습니다.</p>}
      </div>
    </div>
  );
}

export default Guide;