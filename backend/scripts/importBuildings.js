const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sequelize, BuildingInfo } = require('../models'); // 경로는 실제 프로젝트에 맞게 수정

const filePath = path.join(__dirname, '../data/building_info.csv'); // 경로 수정 가능

async function importCSV() {
  const records = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // 숫자 타입 변환
      records.push({
        BUILDING_ID: parseInt(row.BUILDING_ID),
        BUILDING_NAME: row.BUILDING_NAME,
        BUILDING_TYPE: row.BUILDING_TYPE,
        TOTAL_AREA: parseFloat(row.TOTAL_AREA),
        COOLING_AREA: parseFloat(row.COOLING_AREA),
        PV_CAPACITY: parseFloat(row.PV_CAPACITY) || null,
        ESS_CAPACITY: parseFloat(row.ESS_CAPACITY) || null,
        PCS_CAPACITY: parseFloat(row.PCS_CAPACITY) || null,
        LATITUDE: parseFloat(row.LATITUDE),
        LONGITUDE: parseFloat(row.LONGITUDE),
        ADMIN_ID: row.ADMIN_ID
      });
    })
    .on('end', async () => {
      try {
        await sequelize.sync(); // 모델과 DB 동기화
        await BuildingInfo.bulkCreate(records);
        console.log('✅ 건물 데이터 삽입 완료!');
      } catch (err) {
        console.error('❌ 삽입 중 오류:', err.message);
      } finally {
        process.exit();
      }
    });
}

importCSV();
