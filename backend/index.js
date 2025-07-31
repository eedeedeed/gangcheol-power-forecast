// backend/index.js (예시)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models'); // models/index.js 에서 내보낸 sequelize 인스턴스

// 라우터 임포트 (예시)
const userRoutes = require('./routes/userRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();

// 미들웨어
app.use(cors()); // CORS 문제 해결을 위해 필요
app.use(express.json()); // JSON 요청 본문 파싱

// 라우터 연결
app.use('/api/users', userRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);

// DB 연결 및 서버 시작
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('데이터베이스 연결 성공.');
    // 개발 환경에서만 테이블 동기화 (주의: force: true는 기존 데이터 삭제)
    return sequelize.sync(); // 이전에 테이블 구조를 수동으로 변경했으므로, force: true는 사용하지 않는 것이 좋습니다.
                              // 만약 모델과 DB 테이블 간의 불일치가 계속 발생한다면,
                              // 개발 시에만 sequelize.sync({ alter: true })를 고려해볼 수 있습니다.
                              // 하지만 마이그레이션을 사용하는 것이 더 안정적입니다.
  })
  .then(() => {
    app.listen(PORT, () => console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`));
  })
  .catch(err => {
    console.error('데이터베이스 연결 실패:', err);
  });