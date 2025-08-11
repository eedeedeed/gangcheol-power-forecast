import React, { useContext, useState, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { getBuildings } from '../../api/building.api';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsUserDropdownOpen(false), 300);
  };

  // 건물관리 클릭 시 실행될 함수 - user 객체 확인 추가
  const handleBuildingManagementClick = async () => {
    try {
      // 드롭다운 닫기
      setIsUserDropdownOpen(false);
      
      // user 객체가 없으면 에러 처리
      if (!user) {
        console.error('사용자 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }

      // adminId 또는 id가 없으면 에러 처리  
      const adminId = user.adminId || user.id;
      if (!adminId) {
        console.error('사용자 ID 정보가 없습니다.');
        return;
      }
      
      console.log('건물 데이터 요청 시작...', 'AdminID:', adminId);
      const response = await getBuildings(adminId);
      console.log('건물 데이터:', response.data);
      
    } catch (error) {
      console.error('건물 데이터 가져오기 실패:', error);
    }
  };

  const getNavLinkClass = ({ isActive }) => "navbar-item" + (isActive ? " active" : "");

  return (
    <div className="navbar-menu">
        <NavLink to="/dashboard" className={getNavLinkClass}>대시보드</NavLink>
        <NavLink to="/alerts" className={getNavLinkClass}>알림</NavLink>
        <NavLink to="/guide" className={getNavLinkClass}>절감 가이드</NavLink>
        
        <div className="navbar-dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button className="navbar-item navbar-item--dropdown">
                설정 <span className="dropdown-arrow">▼</span>
            </button>
            {isUserDropdownOpen && (
            <div className="navbar-dropdown-menu">
                <Link 
                  to="/monitoring" 
                  className="dropdown-item" 
                  onClick={handleBuildingManagementClick}
                >
                  건물관리
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>설정</Link>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-item dropdown-item--danger">로그아웃</button>
            </div>
            )}
        </div>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="테마 토글">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    </div>
  );
}

export default Navbar;
