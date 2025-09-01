// models/admin.js
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    ADMIN_ID:       { type: DataTypes.STRING(50), primaryKey: true, allowNull: false, field: 'ADMIN_ID' },
    ADMIN_PASSWORD: { type: DataTypes.STRING,     allowNull: false, field: 'ADMIN_PASSWORD' },
    ADMIN_NAME:     { type: DataTypes.STRING,     allowNull: true,  field: 'ADMIN_NAME' },
    deletedYN:      { type: DataTypes.ENUM('N','Y'), allowNull: false, defaultValue: 'N', field: 'deletedYN' },
  }, {
    tableName: 'admin',
    timestamps: false,
    underscored: false,
  });

  // 비밀번호 해시가 이 파일에 필요하면, define 이후 hook로 등록 (ReferenceError 방지)
  Admin.addHook('beforeCreate', async (admin) => {
    if (admin.ADMIN_PASSWORD) {
      const bcrypt = require('bcrypt');
      admin.ADMIN_PASSWORD = await bcrypt.hash(admin.ADMIN_PASSWORD, 10);
    }
  });

  return Admin;
};
