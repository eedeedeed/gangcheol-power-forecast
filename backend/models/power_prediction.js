// models/power_prediction.js  (너가 만든 테이블 DDL 기준, 최소형)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PowerPrediction', {
    SEQ: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // ← AUTO_INCREMENT 권장
    BUILDING_ID: { type: DataTypes.INTEGER, allowNull: false },
    TIMESTAMP: { type: DataTypes.DATE, allowNull: false }, // (권장: PREDICT_AT로 변경)
    PREDICTED_KWH: { type: DataTypes.FLOAT, allowNull: false },
  }, { tableName: 'power_prediction', timestamps: false });
};
