const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const buildingRouters = require('./routes/buildingRoutes');

const app = express();

//req.body (json) 사용
app.use(express.json());

// 라우터
app.use('/admin', adminRoutes);
app.use('/building', buildingRouters);

app.listen(5000, () => {
  console.log('🚀 서버 실행 중: http://localhost:5000');
});
