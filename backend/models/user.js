// models/user.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
      defaultValue: null
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // 비밀번호 해싱 hook
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    if (!user.username) {
      user.username = null;
    }
  });

  // 비밀번호 유효성 검사 메서드
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
