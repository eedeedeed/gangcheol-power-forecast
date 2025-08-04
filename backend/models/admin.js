// models/admin.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    ADMIN_ID: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    ADMIN_PASSWORD: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ADMIN_NAME: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    BUILDING_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'admin',
    timestamps: false
  });

  // 예: 비밀번호 해싱 hook 등 추가 가능

  return Admin;
};
