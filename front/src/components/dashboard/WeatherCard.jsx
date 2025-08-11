import React, { useState, useEffect } from 'react';

const WeatherIcon = ({ condition, size = 48 }) => {
    const iconMap = {
      'clear': '☀️', 'clouds': '☁️', 'rain': '🌧️', 'snow': '❄️',
      'thunderstorm': '⛈️', 'drizzle': '🌦️', 'mist': '🌫️', 'fog': '🌫️'
    };
    return <span style={{ fontSize: `${size}px` }}>{iconMap[condition] || '🌤️'}</span>;
};

function WeatherCard() {
    const [weather, setWeather] = useState({
        temperature: '--', condition: 'clear', description: '날씨 정보 로딩 중...',
        humidity: '--', windSpeed: '--', location: '서울'
    });
    const [loading, setLoading] = useState(true);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            const API_KEY = 'YOUR_API_KEY_HERE';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seoul,KR&appid=${API_KEY}&units=metric&lang=kr`);
            if (!response.ok) throw new Error('날씨 정보를 가져올 수 없습니다.');
            const data = await response.json();
            setWeather({
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main.toLowerCase(),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6),
                location: data.name
            });
        } catch (err) {
            console.error('날씨 API 오류:', err);
            setWeather({
                temperature: 23, condition: 'clear', description: '맑음',
                humidity: 45, windSpeed: 12, location: '서울'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="weather-card-large">
            <div className="weather-header">
                <h3>실시간 날씨(목업입니다)</h3>
                <button className="weather-refresh-btn" onClick={fetchWeather} disabled={loading}>🔄</button>
            </div>
            <div className="weather-body">
                {loading ? (
                    <div className="weather-loading">
                        <div className="loading-spinner"></div>
                        <p>날씨 정보 로딩 중...</p>
                    </div>
                ) : (
                    <div className="weather-content">
                        <div className="weather-main">
                            <div className="weather-icon"><WeatherIcon condition={weather.condition} size={80} /></div>
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
                                <span className="detail-value">{weather.windSpeed} km/h</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeatherCard;