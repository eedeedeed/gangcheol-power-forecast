import React, { useContext } from 'react'; // useContext import
import { AuthContext } from '../contexts/AuthContext'; // AuthContext import

// onLogout prop을 더 이상 받지 않습니다.
function ProfilePage() {
  // AuthContext에서 handleLogout 함수를 직접 가져옵니다.
  const { handleLogout } = useContext(AuthContext);

  // --- 임시 데이터 ---
  const userProfile = {
    username: '사용자123',
    email: 'user@example.com',
    memberSince: '2023년 1월 1일',
    lastLogin: '2025년 8월 10일',
  };
  // --- 여기까지 임시 데이터 ---

  return (
    <div id="profile-page">
      <div className="settings-container" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div className="card">
          <div className="card__body" style={{ padding: '30px' }}>
            <h4>내 프로필</h4>
            <br />
            <p><strong>사용자 이름:</strong> {userProfile.username}</p>
            <p><strong>이메일:</strong> {userProfile.email}</p>
            <p><strong>가입일:</strong> {userProfile.memberSince}</p>
            <p><strong>최근 로그인:</strong> {userProfile.lastLogin}</p>
            <button className="btn btn--secondary" style={{marginTop: '20px'}} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;