# ESG_C 팀프로젝트
> gangcheol-power-forecast 팀 강철전기 ⚡🔌

# Fleak: 전력소비량 예측 · 피크탐지 · 모니터링 (Gangcheol Electric)

[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb)]()
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)]()
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-3c76c3)]()
[![Python](https://img.shields.io/badge/AI-Python%20%2B%20Flask-3776ab)]()
[![XGBoost](https://img.shields.io/badge/Model-XGBoost-orange)]()
[![MySQL](https://img.shields.io/badge/DB-MySQL-00618a)]()

**Fleak**(flex peak)은 건물 단위의 시간별 전력사용량(kWh)을 예측하고, 사전 피크(최대부하) 리스크를 탐지하여 **요금 절감·ESG 대응·전력망 안정화**에 기여하는 대시보드형 서비스입니다.


---

## 🔎 핵심 기능 (Key Features)

- **전력소비량 예측 (XGBoost Regressor)**
- **피크 탐지 (XGBoost Classifier + 통계 임계치 μ, σ / p95)**
- **모니터링 대시보드**: 예측값·실측값·피크 경보·위험도 시각화
- **리플레이 스트리밍** : 과거 시계열 데이터를 1초 간격으로 재생하여 실시간 사용량 모니터링을 시뮬레이션 (1시간 단위 전진).
실제 환경에서는 실시간 데이터 수집이 제한적이므로, 대시보드 사용 시에도 마치 실시간처럼 확인할 수 있도록 리플레이 기능을 구현함.

---

## 🏗️ 아키텍처 (Architecture)

[React (Vite)] <-> [Node.js/Express + Sequelize] <-> [MySQL]
|
| (HTTP)
v
[Flask (AI Service)]
- XGBoost Regressor: kWh 예측
- XGBoost Classifier: Peak 여부/확률

- 프론트: React 19, react-chartjs-2  
- 백엔드: Express(REST), Sequelize(MySQL)  
- AI: Flask API (XGBoost), 시간/날씨/건물특성/랙(lag) 피처  
- DB: `building_info`, `power_consumption`, `sim_replay_data`, `admin` 등

---

## ⚙️ 빠른 시작 (Quick Start)

1. MySQL DB 초기화  
2. Backend 실행: `cd backend && npm install && npm run dev`  
3. AI 서비스 실행: `cd ai && pip install -r requirements.txt && python app.py`  
4. Front 실행: `cd front && npm install && npm run dev`  

---

## 🧠 모델 (AI)

- Feature Set: 시간(sin/cos), 날씨, 건물 특성, lag(1,24,168)  
- Regressor: RMSE, MAPE, R²  
- Classifier: Recall/F1 (피크 미탐 방지 중심)

---

## 📝 라이선스

MIT
