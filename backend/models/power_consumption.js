// models/power_consumption.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PowerConsumption', {
    SEQ: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    BUILDING_ID: { type: DataTypes.INTEGER, allowNull: false },
    TIMESTAMP: { type: DataTypes.DATE, allowNull: false },
    POWER_KWH: { type: DataTypes.FLOAT, allowNull: false },
    // ↓ DB에 존재하는 lag 컬럼들
    POWER_KWH_LAG1:   { type: DataTypes.FLOAT, allowNull: true },
    POWER_KWH_LAG24:  { type: DataTypes.FLOAT, allowNull: true },
    POWER_KWH_LAG168: { type: DataTypes.FLOAT, allowNull: true },
  }, { tableName: 'power_consumption', timestamps: false });
};
