import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as buildingApi from '../api/building.api';

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

    const fetchBuildings = useCallback(async () => {
        try {
            const tempBuildings = [
                // {id: 1, name: "본관"},
                // {id: 2, name: "연구동"},
                // {id: 3, name: "생산동"}
            ];
            setBuildings(tempBuildings);
            if (tempBuildings.length > 0 && !selectedBuildingId) {
                setSelectedBuildingId(tempBuildings[0].id);
            }
        } catch (error) {
            console.error("건물 목록을 불러오는 데 실패했습니다.", error);
        }
    }, [selectedBuildingId]);

    useEffect(() => {
        fetchBuildings();
    }, [fetchBuildings]);
    
    const handleBuildingAdd = useCallback(async (newBuilding) => {
        try {
          await buildingApi.buildingRegister(newBuilding);
          fetchBuildings(); 
          alert('건물이 성공적으로 등록되었습니다.');
        } catch (error) {
          console.error("건물 등록 실패:", error);
          alert('건물 등록에 실패했습니다. 다시 시도해주세요.');
        }
    }, [fetchBuildings]);

    const handleBuildingUpdate = useCallback(async (updatedBuilding) => {
        console.log("Updating building (temp):", updatedBuilding);
        setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
        alert('건물 정보가 수정되었습니다 (프론트엔드).');
    }, []);

    const handleBuildingDelete = useCallback(async (buildingId) => {
        console.log("Deleting building (temp):", buildingId);
        setBuildings(prev => prev.filter(b => b.id !== buildingId));
        alert('건물이 삭제되었습니다 (프론트엔드).');
    }, []);

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