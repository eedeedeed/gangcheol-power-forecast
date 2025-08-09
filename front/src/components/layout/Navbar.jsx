// src/components/layout/Navbar.jsx
import React, { useContext, useRef } from 'react';
import { AppContext } from '../../hooks/AppContext';

// 아이콘 컴포넌트
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

function Navbar() {
  const { 
    activeTab, 
    handleTabClick, 
    isUserDropdownOpen, 
    setIsUserDropdownOpen, 
    handleLogout,
    theme,
    toggleTheme 
  } = useContext(AppContext);
  
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 300); // 0.3초 유지
  };

  return (
    <div className="navbar-menu">
      <button 
        onClick={() => handleTabClick('dashboard')} 
        className={`navbar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        대시보드
      </button>
      <button 
        onClick={() => handleTabClick('alerts')} 
        className={`navbar-item ${activeTab === 'alerts' ? 'active' : ''}`}
      >
        알림
      </button>
      <button 
        onClick={() => handleTabClick('guide')} 
        className={`navbar-item ${activeTab === 'guide' ? 'active' : ''}`}
      >
        절감 가이드
      </button>
      
      {/* 회원정보 드롭다운 메뉴 */}
      <div 
        className="navbar-dropdown"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button 
          className={`navbar-item navbar-item--dropdown ${
            activeTab === 'profile' || activeTab === 'monitoring' || activeTab === 'settings' ? 'active' : ''
          }`}
        >
          회원정보
          <span className="dropdown-arrow">▼</span>
        </button>

        {isUserDropdownOpen && (
          <div className="navbar-dropdown-menu">
            <button 
              onClick={() => handleTabClick('monitoring')}
              className={`dropdown-item ${activeTab === 'monitoring' ? 'active' : ''}`}
            >
              건물관리
            </button>
            <button 
              onClick={() => handleTabClick('profile')}
              className={`dropdown-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              회원정보
            </button>
            <button 
              onClick={() => handleTabClick('profile-edit')}
              className={`dropdown-item ${activeTab === 'profile-edit' ? 'active' : ''}`}
            >
              프로필 수정
            </button>
            <button 
              onClick={() => handleTabClick('settings')}
              className={`dropdown-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              설정
            </button>
            <div className="dropdown-divider"></div>
            <button 
              onClick={handleLogout}
              className="dropdown-item dropdown-item--danger"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* 테마 토글 버튼 */}
      <button 
        onClick={toggleTheme} 
        className="theme-toggle-btn"
        aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}

export default Navbar;
