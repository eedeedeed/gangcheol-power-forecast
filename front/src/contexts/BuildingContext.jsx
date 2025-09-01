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
        // [수정됨] 사용자 정보가 없으면 API를 호출하지 않도록 방어
        if (!user || !user.ADMIN_ID) return;

        try {
            console.log(`--- [BuildingContext] fetchBuildings API 호출 (사용자: ${user.ADMIN_ID})`);
            const response = await buildingApi.getBuildings(user.ADMIN_ID);
            
            const fetchedBuildings = response.data.rows || []; 
            console.log('✅ [BuildingContext] API로부터 추출된 건물 목록:', fetchedBuildings);

            setBuildings(fetchedBuildings);

            if (fetchedBuildings.length > 0) {
                const isSelectedBuildingInList = fetchedBuildings.some(b => b.building_id === selectedBuildingId);
                if (!selectedBuildingId || !isSelectedBuildingInList) {
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
          const dataToSend = { 
            ...newBuilding, 
            admin_id: user.ADMIN_ID 
          };
          
          console.log('🏢 건물 등록 API 요청 데이터:', dataToSend);
          await buildingApi.buildingRegister(dataToSend);
          
          fetchBuildings();
          alert('건물이 성공적으로 등록되었습니다.');
        } catch (error) {
          console.error("건물 등록 실패:", error);
          alert('건물 등록에 실패했습니다. 다시 시도해주세요.');
        }
    }, [user, fetchBuildings]);

    const handleBuildingUpdate = useCallback(async (buildingData) => {
        if (!user || !user.ADMIN_ID) {
            alert('사용자 정보가 없어 수정할 수 없습니다.');
            return;
        }
        try {
            // [수정] 데이터를 저장하는 updateBuilding 함수를 호출합니다.
            await buildingApi.updateBuilding(buildingData.building_id, buildingData);
            alert('건물 정보가 성공적으로 수정되었습니다.');
            fetchBuildings(); // 목록 새로고침
        } catch (error) {
            console.error("건물 정보 수정 실패:", error);
            alert('건물 정보 수정에 실패했습니다.');
            throw error; // [수정] 에러를 다시 던져서 UI단에서 후속 처리를 할 수 있게 합니다.
        }
    }, [user, fetchBuildings]);

    const handleBuildingDelete = useCallback(async (buildingId) => {
        console.log(`[Context] handleBuildingDelete 호출됨. buildingId: ${buildingId}`);
        if (!user || !user.ADMIN_ID) {
            console.error('[Context] 사용자 정보가 없어 삭제를 중단합니다.');
            alert('사용자 정보가 없어 삭제할 수 없습니다.');
            return;
        }
        try {
            console.log(`[Context] 삭제 API 호출 시도: buildingId = ${buildingId}`);
            const response = await buildingApi.deleteBuilding(buildingId);
            console.log('[Context] 삭제 API 성공 응답:', response);
            alert('건물이 성공적으로 삭제되었습니다.');
            fetchBuildings(); // 목록 새로고침
        } catch (error) {
            console.error("[Context] 건물 삭제 실패:", error);
            if (error.response) {
              console.error('[Context] 에러 응답 데이터:', error.response.data);
              console.error('[Context] 에러 응답 상태:', error.response.status);
              console.error('[Context] 에러 응답 헤더:', error.response.headers);
            } else if (error.request) {
              console.error('[Context] 서버에서 응답을 받지 못했습니다:', error.request);
            } else {
              console.error('[Context] 요청 설정 중 오류 발생:', error.message);
            }
            alert('건물 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    }, [user, fetchBuildings]);
    
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