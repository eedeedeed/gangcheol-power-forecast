module.exports = (sequelize, DataTypes) => {
  const BuildingInfo = sequelize.define('BuildingInfo', {
    BUILDING_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    BUILDING_NAME: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    BUILDING_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TOTAL_AREA: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    COOLING_AREA: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PV_CAPACITY: DataTypes.FLOAT,
    ESS_CAPACITY: DataTypes.FLOAT,
    PCS_CAPACITY: DataTypes.FLOAT,
    LATITUDE: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    LONGITUDE: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ADMIN_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    tableName: 'BUILDING_INFO',
    timestamps: false
  });

  BuildingInfo.associate = (models) => {
    BuildingInfo.belongsTo(models.Admin, {
      foreignKey: 'ADMIN_ID',
      targetKey: 'ADMIN_ID'
    });
  };

  return BuildingInfo;
};
