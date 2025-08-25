import React, { useContext } from 'react';
import { BuildingContext } from '../../contexts/BuildingContext';
import { AuthContext } from '../../contexts/AuthContext';

function Sidebar() {
  const { buildings, selectedBuildingId, setSelectedBuildingId } = useContext(BuildingContext);
  const { user } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      {user && (
        <section className="sidebar-section user-profile-section">
          <h4 className="user-profile-name">{user.ADMIN_NAME}({user.ADMIN_ID})</h4>
        </section>
      )}

      <section className="sidebar-section">
        <h4>건물 선택</h4>
        <select value={selectedBuildingId || ''} onChange={(e) => setSelectedBuildingId(Number(e.target.value))} className="form-control">
          {buildings.map(building => (
            <option key={building.building_id} value={building.building_id}>
              {building.building_name}
            </option>
          ))}
        </select>
      </section>
      
    </aside>
  );
}

export default Sidebar;