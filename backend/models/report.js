const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    userId: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title:{
      type: DataTypes.STRING,
      allowNull: false, 
    },
    content:{
      type: DataTypes.TEXT,
      allowNull: true   
    },
    energyUsage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    carbonEmission: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {
    tableName: 'reports', // 테이블 이름 설정 (선택 사항)
    timestamps: true, // createdAt을 수동으로 관리하므로 timestamps는 true로 설정
  });

  // 관계 설정
  Report.associate = (models) => {
    Report.belongsTo(models.User, {foreignKey: 'userId', as: 'user' });
  };

  return Report;
};