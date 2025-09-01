import React, { useState, useEffect, useRef } from 'react';

function IntervalDropdown({ activeInterval, onIntervalChange, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const intervals = [
        { key: 'realtime', label: '실시간' }, { key: '15min', label: '15분' },
        { key: '30min', label: '30분' }, { key: '60min', label: '1시간' }
    ];
    const currentInterval = intervals.find(item => item.key === activeInterval);
    const dropdownRef = useRef(null);

    const handleSelect = (intervalKey) => {
        onIntervalChange(intervalKey);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`interval-dropdown ${className}`} ref={dropdownRef}>
            <button className={`dropdown-button ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)} type="button">
                <span>{currentInterval?.label || '실시간'}</span>
                <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                {intervals.map((interval) => (
                    <button key={interval.key} className={`dropdown-item ${activeInterval === interval.key ? 'selected' : ''}`} onClick={() => handleSelect(interval.key)} type="button">
                        {interval.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default IntervalDropdown;