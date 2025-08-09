// src/components/Guide.jsx
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../hooks/AppContext';

function Guide({ guides }) {
  const { highlightedGuideId, setHighlightedGuideId, handleDismissGuide } = useContext(AppContext);

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
      <div className="guide-container" id="guideContainer">
        {guides.map((guide, index) => (
          <div 
            key={index} 
            className={`guide-card ${index === highlightedGuideId ? 'blink' : ''}`}
          >
            <div className="guide-header">
              <div className="guide-action">{guide.action}</div>
              <div className="guide-meta">
                <div className="guide-saving">{guide.expected_saving} 절감</div>
                <button 
                  onClick={() => handleDismissGuide(index)} 
                  className="card-close-btn" // 재사용
                  aria-label="가이드 닫기"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="guide-description">{guide.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guide;
