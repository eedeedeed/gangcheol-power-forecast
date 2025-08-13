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

// 아이콘 컴포넌트
const WeatherIcon = ({ icon, size = 48 }) => {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{icon}</span>;
};

// 새로고침 아이콘 SVG 컴포넌트
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function WeatherCard() {
    const { selectedBuilding } = useContext(BuildingContext);
    const [weather, setWeather] = useState({
        temperature: '--',
        humidity: '--',
        windSpeed: '--',
        description: '정보 없음',
        icon: '🌤️',
        location: '날씨 정보 로딩 중...',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWeatherByLocation = async (lat, lng) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCurrentWeather({ lat, lng });
            console.log('API로부터 받은 날씨 데이터:', response.data);
            
            const weatherData = response.data.weather;
            const displayData = getWeatherDisplayData(weatherData.PTY);
            const locationName = response.data.address || '현재 위치주소를 불러올 수 없습니다.';
            

            setWeather({
                temperature: weatherData.T1H,
                humidity: weatherData.REH,
                windSpeed: weatherData.WSD,
                description: displayData.description,
                icon: displayData.icon,
                location: locationName,
            });
        } catch (err) {
            console.error('위치 기반 날씨 API 오류:', err);
            setError('날씨 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRefresh = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeatherByLocation(position.coords.latitude, position.coords.longitude),
                (err) => {
                    console.error('Geolocation 오류:', err);
                    setError('위치 정보를 가져올 수 없습니다.');
                    setLoading(false);
                }
            );
        } else {
            setError('브라우저가 위치 정보를 지원하지 않습니다.');
            setLoading(false);
        }
    };

    useEffect(() => {
        handleRefresh(); 
    }, [selectedBuilding]);


    return (
        <div className="weather-card-large">
            <div className="weather-header">
                <h3>실시간 날씨</h3>
                <button className="weather-refresh-btn" onClick={handleRefresh} disabled={loading} aria-label="날씨 새로고침">
                    <RefreshIcon />
                </button>
            </div>
            <div className="weather-body">
                {loading ? (
                    <div className="weather-loading"><div className="loading-spinner"></div><p>날씨 정보 로딩 중...</p></div>
                ) : error ? (
                    <div className="weather-error"><p>{error}</p></div>
                ) : (
                    <div className="weather-content">
                        <div className="weather-main">
                            <div className="weather-icon"><WeatherIcon icon={weather.icon} size={64} /></div>
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
                                <span className="detail-value">{weather.windSpeed}m/s</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeatherCard;
