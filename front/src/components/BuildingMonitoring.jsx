// src/components/BuildingMonitoring.jsx
// 이 파일은 여러 건물의 실시간 전력 사용량 및 상태를 모니터링하는 컴포넌트입니다.
// 각 건물에 대한 정보를 카드 형태로 표시합니다.

import React from 'react';

function BuildingMonitoring({ buildings }) {
  // props:
  // - buildings: 모니터링할 건물들의 배열. 각 건물 객체는 id, name, current(현재 사용량), status(상태: 'normal' 또는 'warning')를 포함합니다.

  return (
    // 건물 모니터링 페이지의 최상위 컨테이너입니다.
    <div id="monitoring">
      <h3>건물 모니터링</h3>
      {/* 건물 카드들을 담는 그리드 컨테이너입니다. */}
      <div className="building-grid" id="buildingGrid">
        {/* buildings 배열을 순회하며 각 건물에 대한 카드 컴포넌트를 렌더링합니다. */}
        {buildings.map(building => (
          // 각 건물 카드의 고유 키는 building.id를 사용합니다.
          <div key={building.id} className="card building-card">
            {/* 건물 카드의 헤더 부분입니다. */}
            <div className="building-header">
              {/* 건물 이름입니다. */}
              <div className="building-name">{building.name}</div>
              {/* 건물 상태를 나타내는 스팬 태그입니다.
                  상태에 따라 다른 CSS 클래스(status--info 또는 status--warning)가 적용됩니다. */}
              <span className={`status ${building.status === 'normal' ? 'status--info' : 'status--warning'}`}>
                {/* 상태 텍스트를 한글로 표시합니다. */}
                {building.status === 'normal' ? '정상' : '주의'}
              </span>
            </div>
            {/* 건물 현재 사용량을 표시하는 부분입니다. */}
            <div className="building-usage">
              {/* 현재 사용량을 로케일 형식에 맞게 포맷팅하고 'kW' 단위를 붙입니다. */}
              {building.current.toLocaleString()}<span className="building-unit">kW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuildingMonitoring;
