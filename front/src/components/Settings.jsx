// src/components/Settings.jsx
// 이 파일은 애플리케이션의 설정 페이지 컴포넌트입니다.
// 현재는 시스템 설정과 구독하기 섹션을 포함하고 있습니다.

import React from 'react';

function Settings() {
  // Settings 컴포넌트는 현재 특별한 prop을 받지 않습니다.

  return (
    // 설정 페이지의 최상위 컨테이너입니다.
    <div id="settings">
      {/* 설정 항목들을 담는 컨테이너입니다. */}
      <div className="settings-container">
        {/* 시스템 설정 카드입니다. */}
        <div className="card">
          <div className="card__body">
            <h4>시스템 설정</h4>
            <p>시스템 설정 기능은 개발 중입니다.</p>
          </div>
        </div>
        {/* 구독 관련 섹션 카드입니다. */}
        <div className="card">
          <div className="card__body">
            <h4>구독하기</h4> {/* 제목을 "구독하기"로 변경 */}
            <p>프리미엄 기능과 알림을 구독하여 더 많은 혜택을 누리세요.</p>
            {/* 구독하기 버튼입니다. 클릭 시 콘솔에 로그를 출력합니다. */}
            {/* 실제 앱에서는 구독 결제 흐름이나 관련 페이지로 이동하는 로직이 추가될 수 있습니다. */}
            <button className="btn btn--primary" onClick={() => console.log('구독하기 버튼 클릭됨')}>
              구독하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
