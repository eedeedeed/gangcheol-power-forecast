// backend/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/db')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 모델 불러오기
const Admin = require('./admin')(sequelize, DataTypes);


// 여러 모델이 있다면 여기에 추가로 정의
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Admin = Admin;

module.exports = db;
