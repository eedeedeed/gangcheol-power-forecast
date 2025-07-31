// backend/models/user.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    // id는 Sequelize가 자동으로 관리하므로 여기에 명시할 필요는 없습니다.
    username: {
      type: DataTypes.STRING,
      allowNull: true,      // 필수 아님
      unique: false,        // 여기를 false로 변경하여 고유 제약 조건을 제거합니다.
      defaultValue: null    // 명시적으로 기본값을 null로 설정 (선택 사항이지만 명확성을 위해)
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,     // 이메일은 계속 필수 및 고유해야 합니다.
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'users', // 테이블 이름을 명시적으로 지정
    timestamps: true // createdAt, updatedAt 자동 생성
  });

  // 비밀번호 해싱 (저장 전)
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    // username이 제공되지 않았다면 null로 설정 (Sequelize가 자동으로 처리하지만 명시적으로)
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
