// src/components/ProfilePage.jsx
// 이 파일은 사용자 프로필 정보를 표시하는 컴포넌트입니다.

import React from 'react';

function ProfilePage({ onLogout }) { // onLogout prop 추가
  // 임시 사용자 프로필 데이터입니다. 실제 앱에서는 로그인된 사용자 정보를 가져와야 합니다.
  const userProfile = {
    username: '사용자123',
    email: 'user@example.com',
    memberSince: '2023년 1월 1일',
    lastLogin: '2025년 7월 30일 09:00',
    // 여기에 더 많은 프로필 정보를 추가할 수 있습니다.
  };

  return (
    // 프로필 페이지의 최상위 컨테이너입니다.
    <div id="profile-page">
      <h3>회원정보</h3>
      <div className="settings-container"> {/* Settings 컴포넌트의 컨테이너 스타일 재사용 */}
        <div className="card">
          <div className="card__body">
            <h4>내 프로필</h4>
            <p><strong>사용자 이름:</strong> {userProfile.username}</p>
            <p><strong>이메일:</strong> {userProfile.email}</p>
            <p><strong>가입일:</strong> {userProfile.memberSince}</p>
            <p><strong>최근 로그인:</strong> {userProfile.lastLogin}</p>
            {/* 프로필 수정 버튼 */}
            <button className="btn btn--primary" style={{marginTop: '20px', marginRight: '10px'}} onClick={() => console.log('프로필 수정 버튼 클릭됨')}>
              프로필 수정
            </button>
            {/* 로그아웃 버튼 추가 */}
            <button className="btn btn--secondary" style={{marginTop: '20px'}} onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
        {/* 추가적인 프로필 관련 섹션을 여기에 포함할 수 있습니다. */}
        <div className="card">
          <div className="card__body">
            <h4>구독 현황</h4>
            <p>현재 무료 플랜을 사용 중입니다.</p>
            <button className="btn btn--primary" onClick={() => console.log('구독 변경 버튼 클릭됨')}>
              구독 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
