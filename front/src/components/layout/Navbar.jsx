import React, { useContext, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { BuildingContext } from '../../contexts/BuildingContext';

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

// ✅ [수정] Navbar의 props에서 openEditConfirmModal 제거. Dashboard에서 직접 관리
function Navbar({ isEditMode, onEditModeToggle, onTestNotification }) {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { buildings, selectedBuildingId, setSelectedBuildingId } = useContext(BuildingContext);
  
  const location = useLocation();
  const isDashboardPage = location.pathname.includes('/dashboard');

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsUserDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsUserDropdownOpen(false), 300);
  };

  const handleEditClick = () => {
    onEditModeToggle(); // 편집 모드만 토글
    setIsUserDropdownOpen(false); // 드롭다운 메뉴 닫기
  };

  return (
    <>
      {isDashboardPage && (
        <div className="navbar-controls">
          {/* ✅ [제거] 테스트 알림 버튼 제거 */}
        </div>
      )}

      <div className="navbar-right-section">
          <div className="navbar-info-section">
              {user && <span className="navbar-user-info">{user.ADMIN_NAME} ({user.ADMIN_ID})</span>}
              <div className="navbar-building-selector">
                  <label htmlFor="building-select-nav">현재 건물:</label>
                  <select
                      id="building-select-nav"
                      value={selectedBuildingId || ''}
                      onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                      className="form-control"
                  >
                    {buildings.map(building => ( <option key={building.building_id} value={building.building_id}>{building.building_name}</option>))}
                  </select>
              </div>
          </div>
          <div className="navbar-menu">
              <div className="navbar-dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <button className="navbar-item navbar-item--dropdown">
                      설정 <span className="dropdown-arrow">▼</span>
                  </button>
                  {isUserDropdownOpen && (
                  <div className="navbar-dropdown-menu">
                      {isDashboardPage && (
                        <button onClick={handleEditClick} className="dropdown-item">
                          대시보드 편집
                        </button>
                      )}
                      <Link to="/monitoring" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>건물관리</Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={logout} className="dropdown-item dropdown-item--danger">로그아웃</button>
                  </div>
                  )}
              </div>
              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="테마 토글">
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
          </div>
      </div>
    </>
  );
}

export default Navbar;