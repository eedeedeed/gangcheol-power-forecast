// src/main.jsx
// 이 파일은 React 애플리케이션의 진입점(Entry Point)입니다.
// React 앱을 DOM에 마운트(렌더링)하는 역할을 합니다.

import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18의 새로운 클라이언트 렌더링 API 임포트
import App from './App.jsx'; // 애플리케이션의 최상위 컴포넌트인 App을 임포트합니다.
// import './style.css'; // 이전에 중복되던 전역 스타일 시트 임포트가 제거되었습니다. (이전 피드백 참조)

// 'root' ID를 가진 DOM 요소에 React 애플리케이션을 렌더링합니다.
// React.StrictMode는 개발 모드에서 잠재적인 문제를 감지하기 위한 도구입니다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* App 컴포넌트를 렌더링합니다. */}
  </React.StrictMode>,
);
