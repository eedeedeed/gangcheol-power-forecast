require('dotenv').config();

const express = require('express');
const db = require('./models');
const config = require('./config/config');
const cors = require('cors');

const app = express();
// 포트 설정
const PORT = config.port || 3000;


// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱
app.use(cors()); // 모든 출처에서 API 접근 허용


// 라우트 설정&불러오기
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const predictionRoutes = require('./routes/predictionRoutes'); // AI 예측 라우트 추가

//라우트 연결
app.use('/api/users', userRoutes);                // 사용자 관련 라우트 연결
app.use('/api/reports', reportRoutes);           // 리포트 관련 라우트 연결  
app.use('/api/predictions', predictionRoutes);  // 예측 라우트 연결

// 데이터베이스 동기화 및 서버 시작
db.sequelize.sync({ force: false }) // force: true는 기존 테이블을 삭제하지 않고 유지
  .then(() => {
    console.log('MySQL 데이터베이스 동기화 완료');
    app.listen(PORT, () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('데이터베이스 연결 및 동기화 실패:', err);
  });

// 디버깅용: 환경 변수 출력
console.log('DB_NAME:', process.env.DB_NAME); // 디버깅용