// models/admin.js
// admin table 정의

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('ADMIN', {  // 테이블명 대문자로 변경
    ADMIN_ID: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    ADMIN_PASSWORD: {    // 컬럼명 대문자 및 맞춤
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ADMIN_NAME: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    BUILDING_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedYN: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N'
    }

  }, {
    tableName: 'ADMIN',  // 테이블명 대문자 지정
    timestamps: false
  });

  // 비밀번호 해싱 hook 예시
  Admin.beforeCreate(async (admin) => {
    if (admin.ADMIN_PASSWORD) {
      const salt = await bcrypt.genSalt(10);
      admin.ADMIN_PASSWORD = await bcrypt.hash(admin.ADMIN_PASSWORD, salt);
    }
  });

  return Admin;
};
