// src/components/Guide.jsx
// 이 파일은 전력 절감 가이드를 표시하는 컴포넌트입니다.
// 각 절감 항목에 대한 행동, 예상 절감량, 설명을 카드 형태로 제공합니다.

import React from 'react';

function Guide({ guides }) {
  // props:
  // - guides: 절감 가이드 항목들의 배열. 각 가이드 객체는 action, expected_saving, description을 포함합니다.

  return (
    // 절감 가이드 페이지의 최상위 컨테이너입니다.
    <div id="guide">
      {/* 가이드 카드들을 담는 컨테이너입니다. */}
      <div className="guide-container" id="guideContainer">
        {/* guides 배열을 순회하며 각 가이드 항목에 대한 카드 컴포넌트를 렌더링합니다. */}
        {guides.map((guide, index) => (
          // 각 가이드 카드의 고유 키는 index를 사용합니다.
          <div key={index} className="guide-card">
            {/* 가이드 카드의 헤더 부분입니다. */}
            <div className="guide-header">
              {/* 절감 행동을 표시합니다. */}
              <div className="guide-action">{guide.action}</div>
              {/* 예상 절감량을 표시합니다. */}
              <div className="guide-saving">{guide.expected_saving} 절감</div>
            </div>
            {/* 가이드에 대한 상세 설명을 표시합니다. */}
            <div className="guide-description">{guide.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guide;
