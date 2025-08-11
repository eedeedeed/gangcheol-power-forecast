// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/db')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 개별 모델 로드 (DDL에 맞춰 tableName은 각 파일에서 지정)
const Admin = require('./admin')(sequelize, DataTypes);
const BuildingInfo = require('./building')(sequelize, DataTypes);

/**
 * Associations
 *
 * 1) 소유 관계: building_info.ADMIN_ID  → admin.ADMIN_ID
 *    한 관리자(Admin)가 여러 건물(BuildingInfo)을 소유 가능
 *    GET /buildings?adminId=... 조회에 사용
 */
Admin.hasMany(BuildingInfo, {
  foreignKey: 'ADMIN_ID',   // building_info 컬럼명
  sourceKey: 'ADMIN_ID',
  as: 'Buildings',
});
BuildingInfo.belongsTo(Admin, {
  foreignKey: 'ADMIN_ID',   // building_info 컬럼명
  targetKey: 'ADMIN_ID',
  as: 'OwnerAdmin',
});

/**
 * 2) 대표 건물 관계: admin.BUILDING_ID → building_info.BUILDING_ID
 *    한 관리자가 대표 건물을 하나 선택할 수 있음(Nullable)
 */
// 대표 건물 관계
Admin.belongsTo(BuildingInfo, {
  foreignKey: 'BUILDING_ID',      // Admin 테이블 컬럼명 (DB 컬럼)
  targetKey: 'building_id',       // BuildingInfo 모델 속성명
  as: 'MainBuilding',
});
BuildingInfo.hasMany(Admin, {
  foreignKey: 'BUILDING_ID',      // Admin 테이블 컬럼명
  sourceKey: 'building_id',       // BuildingInfo 모델 속성명
  as: 'AdminsSelectedAsMain',
});


// 내보내기
const db = { sequelize, Sequelize, Admin, BuildingInfo };
module.exports = db;
