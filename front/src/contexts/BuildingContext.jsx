import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as buildingApi from '../api/building.api';
import { AuthContext } from './AuthContext';

const defaultBuildingContext = {
    buildings: [],
    selectedBuildingId: null,
    setSelectedBuildingId: () => {},
    handleBuildingAdd: async () => {},
    handleBuildingUpdate: async () => {},
    handleBuildingDelete: async () => {},
};

export const BuildingContext = createContext(defaultBuildingContext);

export default function BuildingProvider({ children }) {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchBuildings = useCallback(async () => {
        // useCallback 안에서는 user prop을 직접 신뢰합니다.
        // 호출하는 쪽에서 user가 유효한지 검사해야 합니다.
        try {
            console.log(`--- [BuildingContext] fetchBuildings API 호출 (사용자: ${user.ADMIN_ID})`);
            const response = await buildingApi.getBuildings(user.ADMIN_ID);
            
            // ⭐️ 백엔드 응답 구조에 맞춰 실제 건물 배열인 response.data.rows를 추출합니다.
            const fetchedBuildings = response.data.rows || []; 
            console.log('✅ [BuildingContext] API로부터 추출된 건물 목록:', fetchedBuildings);

            setBuildings(fetchedBuildings);

            if (fetchedBuildings.length > 0) {
                const isSelectedBuildingInList = fetchedBuildings.some(b => b.building_id === selectedBuildingId);
                if (!selectedBuildingId || !isSelectedBuildingInList) {
                    // ⭐️ 백엔드 데이터의 ID 필드명인 'building_id'를 사용합니다.
                    setSelectedBuildingId(fetchedBuildings[0].building_id);
                }
            } else {
                setSelectedBuildingId(null);
            }
        } catch (error) {
            console.error("[BuildingContext] 건물 목록을 불러오는 중 에러 발생:", error);
            setBuildings([]);
            setSelectedBuildingId(null);
        }
    }, [user, selectedBuildingId]);

    useEffect(() => {
        fetchBuildings();
    }, [fetchBuildings]);
    
    const handleBuildingAdd = useCallback(async (newBuilding) => {
        if (!user || !user.ADMIN_ID) {
            alert('사용자 정보가 없어 건물을 등록할 수 없습니다. 다시 로그인해주세요.');
            return;
        }

        try {
          // API로 보내기 전, 건물 데이터에 현재 로그인한 사용자의 ID를 추가합니다.
          const dataToSend = { 
            ...newBuilding, 
            admin_id: user.ADMIN_ID 
          };
          
          console.log('🏢 건물 등록 API 요청 데이터:', dataToSend);
          await buildingApi.buildingRegister(dataToSend);
          
          fetchBuildings(); // 건물 목록을 다시 불러옵니다.
          alert('건물이 성공적으로 등록되었습니다.');
        } catch (error) {
          console.error("건물 등록 실패:", error);
          alert('건물 등록에 실패했습니다. 다시 시도해주세요.');
        }
    }, [user, fetchBuildings]);

    const handleBuildingUpdate = useCallback(async (updatedBuilding) => {
        // 수정 API 연동 필요
        fetchBuildings();
    }, [fetchBuildings]);

    const handleBuildingDelete = useCallback(async (buildingId) => {
        // 삭제 API 연동 필요
        fetchBuildings();
    }, [fetchBuildings]);
    
    const value = {
        buildings,
        selectedBuildingId,
        setSelectedBuildingId,
        handleBuildingAdd,
        handleBuildingUpdate,
        handleBuildingDelete,
    };

    return (
        <BuildingContext.Provider value={value}>
            {children}
        </BuildingContext.Provider>
    );
}