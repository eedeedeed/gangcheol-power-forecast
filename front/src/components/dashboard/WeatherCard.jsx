import React, { useState, useEffect, useContext } from 'react';
import { BuildingContext } from '../../contexts/BuildingContext';
import { getCurrentWeather } from '../../api/dashboard.api';

// PTY 코드에 따른 날씨 아이콘과 한글 설명을 반환하는 헬퍼 함수
const getWeatherDisplayData = (ptyCode) => {
  const ptyMap = {
    '0': { condition: 'clear', description: '맑음', icon: '☀️' },
    '1': { condition: 'rain', description: '비', icon: '🌧️' },
    '2': { condition: 'rain_snow', description: '비/눈', icon: '🌦️' },
    '3': { condition: 'snow', description: '눈', icon: '❄️' },
    '5': { condition: 'drizzle', description: '빗방울', icon: '💧' },
    '6': { condition: 'drizzle_snow', description: '빗방울/눈날림', icon: '💧❄️' },
    '7': { condition: 'snow_flying', description: '눈날림', icon: '🌨️' },
  };
  return ptyMap[ptyCode] || { condition: 'unknown', description: '정보 없음', icon: '🌤️' };
};


const WeatherIcon = ({ icon, size = 48 }) => {
    return <span style={{ fontSize: `${size}px` }}>{icon}</span>;
};

function WeatherCard() {
    const { selectedBuilding } = useContext(BuildingContext);
    const [weather, setWeather] = useState({
        temperature: '--',
        humidity: '--',
        windSpeed: '--',
        condition: 'clear',
        description: '정보 없음',
        icon: '🌤️',
        location: '날씨 정보 로딩 중...',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 위치 기반으로 날씨를 가져오는 함수
    const fetchWeatherByLocation = async (lat, lng) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCurrentWeather({ lat, lng });
            const weatherData = response.data.current_weather;
            const displayData = getWeatherDisplayData(weatherData.PTY);

            setWeather({
                temperature: weatherData.T1H,
                humidity: weatherData.REH,
                windSpeed: weatherData.WSD,
                condition: displayData.condition,
                description: displayData.description,
                icon: displayData.icon,
                location: '현재 위치', // 위치 기반으로 조회했음을 명시
            });
        } catch (err) {
            console.error('위치 기반 날씨 API 오류:', err);
            setError('현재 위치의 날씨 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };
    
    // 새로고침 버튼 클릭 핸들러
    const handleRefresh = () => {
        setError(null);
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByLocation(latitude, longitude);
                },
                (err) => {
                    console.error('Geolocation 오류:', err);
                    setError('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
                    setLoading(false);
                }
            );
        } else {
            setError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
            setLoading(false);
        }
    };

    // 컴포넌트가 처음 마운트될 때, 그리고 선택된 건물이 바뀔 때 실행
    useEffect(() => {
        // 선택된 건물이 있으면 해당 건물의 날씨를 가져옵니다.
        // (이 부분은 기존 buildingId 기반 API가 필요하며, 현재는 위치 기반만 구현)
        // 지금은 초기 로딩 시 현재 위치 기반으로 날씨를 가져오도록 합니다.
        handleRefresh(); 
    }, [selectedBuilding]);


    return (
        <div className="weather-card-large">
            <div className="weather-header">
                <h3>실시간 날씨</h3>
                {/* 새로고침 버튼에 새로운 핸들러 연결 */}
                <button className="weather-refresh-btn" onClick={handleRefresh} disabled={loading}>🔄</button>
            </div>
            <div className="weather-body">
                {loading ? (
                    <div className="weather-loading">
                        <div className="loading-spinner"></div>
                        <p>날씨 정보 로딩 중...</p>
                    </div>
                ) : error ? (
                    <div className="weather-error">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="weather-content">
                        <div className="weather-main">
                            <div className="weather-icon"><WeatherIcon icon={weather.icon} size={80} /></div>
                            <div className="weather-temp">
                                <span className="temp-value">{weather.temperature}</span>
                                <span className="temp-unit">°C</span>
                            </div>
                        </div>
                        <div className="weather-info">
                            <div className="weather-location">{weather.location}</div>
                            <div className="weather-description">{weather.description}</div>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-label">습도</span>
                                <span className="detail-value">{weather.humidity}%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">풍속</span>
                                <span className="detail-value">{weather.windSpeed} m/s</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeatherCard;
