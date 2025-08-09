// backend/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/db')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 등록
const Admin         = require('./admin')(sequelize, DataTypes);
const BuildingInfo  = require('./building')(sequelize, DataTypes);
//const PowerConsumption = require('./powerConsumption')(sequelize, DataTypes);   // 신규
//const PowerPrediction  = require('./powerPrediction')(sequelize, DataTypes);    // 선택

// 연관관계가 파일에 있으면 자동 실행됨 (building.js에 belongsTo 있음) 
const db = { sequelize, Sequelize, Admin, BuildingInfo };
module.exports = db;

module.exports = db;
