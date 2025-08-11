const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const buildingRouters = require('./routes/buildingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const predictRoutes = require('./routes/predictRoutes');

const app = express();

// CORS 설정(프론트서버)
app.use(cors({
  origin: 'http://localhost:5173',  // 프론트 주소 (React 기본 포트)
  credentials: true                 // 쿠키, 인증 헤더 등 허용하려면 true
}));

//req.body (json) 사용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터
app.use('/admin', adminRoutes);
app.use('/building', buildingRouters);
app.use('/location', locationRoutes);
app.use('/', predictRoutes);

//서버실행
app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 서버 실행 중');
});
