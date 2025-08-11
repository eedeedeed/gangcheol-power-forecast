// models/admin.js
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    ADMIN_ID: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    ADMIN_PASSWORD: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ADMIN_NAME: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    BUILDING_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,             // FK -> building_info(BUILDING_ID)
    },
    deletedYN: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N',
    },
  }, {
    tableName: 'admin',            // ← DDL은 소문자 테이블명
    timestamps: false,
    underscored: false,
  });

  // 비번 해시 (이미 해시되어 넘어오면 생략됨)
  Admin.beforeCreate(async (admin) => {
    if (admin.ADMIN_PASSWORD && !admin.ADMIN_PASSWORD.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      admin.ADMIN_PASSWORD = await bcrypt.hash(admin.ADMIN_PASSWORD, salt);
    }
  });

  return Admin;
};
