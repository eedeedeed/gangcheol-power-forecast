// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const cfg = require('../config/db')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  cfg.database,
  cfg.username,
  cfg.password,
  { ...cfg, logging: false } // 쿼리 로그 무음
);

// 모델 로드
const Admin         = require('./admin')(sequelize, DataTypes);
const BuildingInfo  = require('./building')(sequelize, DataTypes);
const PowerConsumption = require('./powerConsumption')
  ? require('./powerConsumption')(sequelize, DataTypes)
  : undefined;

// 관계 정의: 관리자 1 → N 건물
Admin.hasMany(BuildingInfo,   { foreignKey: 'ADMIN_ID', sourceKey: 'ADMIN_ID' });
BuildingInfo.belongsTo(Admin, { foreignKey: 'ADMIN_ID', targetKey: 'ADMIN_ID' });

// export
const db = { sequelize, Sequelize, Admin, BuildingInfo };
if (PowerConsumption) db.PowerConsumption = PowerConsumption;

module.exports = db;
