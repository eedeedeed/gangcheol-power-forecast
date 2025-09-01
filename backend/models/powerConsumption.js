// models/powerConsumption.js
module.exports = (sequelize, DataTypes) => {
  const PowerConsumption = sequelize.define('PowerConsumption', {
    seq:           { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, field: 'SEQ' },
    building_id:   { type: DataTypes.INTEGER, allowNull: false, field: 'BUILDING_ID' },
    timestamp:     { type: DataTypes.DATE,    allowNull: false, field: 'TIMESTAMP' },
    power_kwh:     { type: DataTypes.FLOAT,   allowNull: false, field: 'POWER_KWH' },

    // ✅ 실제 테이블 컬럼명에 매핑
    power_kwh_lag1:   { type: DataTypes.FLOAT, allowNull: true, field: 'POWER_KWH_LAG1' },
    power_kwh_lag24:  { type: DataTypes.FLOAT, allowNull: true, field: 'POWER_KWH_LAG24' },
    power_kwh_lag168: { type: DataTypes.FLOAT, allowNull: true, field: 'POWER_KWH_LAG168' },
  }, {
    tableName: 'power_consumption',
    timestamps: false,
  });

  return PowerConsumption;
};
