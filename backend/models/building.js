// models/building.js
module.exports = (sequelize, DataTypes) => {
  const BuildingInfo = sequelize.define('BuildingInfo', {
    BUILDING_ID:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, field: 'BUILDING_ID' },
    BUILDING_NAME:   { type: DataTypes.STRING(100), allowNull: true,  field: 'BUILDING_NAME' },
    BUILDING_TYPE:   { type: DataTypes.STRING(50),  allowNull: false, field: 'BUILDING_TYPE' },
    BUILDING_ADDRESS:{ type: DataTypes.STRING(200), allowNull: true,  field: 'BUILDING_ADDRESS' },
    TOTAL_AREA:      { type: DataTypes.FLOAT,       allowNull: false, field: 'TOTAL_AREA' },
    COOLING_AREA:    { type: DataTypes.FLOAT,       allowNull: false, field: 'COOLING_AREA' },
    COOLING_RATIO:   { type: DataTypes.FLOAT,       allowNull: true,  field: 'COOLING_RATIO' }, // 생성열(Stored)
    PV_CAPACITY:     { type: DataTypes.FLOAT,       allowNull: true,  defaultValue: 0, field: 'PV_CAPACITY' },
    ESS_CAPACITY:    { type: DataTypes.FLOAT,       allowNull: true,  defaultValue: 0, field: 'ESS_CAPACITY' },
    PCS_CAPACITY:    { type: DataTypes.FLOAT,       allowNull: true,  defaultValue: 0, field: 'PCS_CAPACITY' },
    LATITUDE:        { type: DataTypes.DECIMAL(10,7), allowNull: true, field: 'LATITUDE' },
    LONGITUDE:       { type: DataTypes.DECIMAL(10,7), allowNull: true, field: 'LONGITUDE' },
    NX:              { type: DataTypes.SMALLINT,    allowNull: true,  field: 'NX' },
    NY:              { type: DataTypes.SMALLINT,    allowNull: true,  field: 'NY' },
    GEOCODE_STATUS:  { type: DataTypes.ENUM('PENDING','OK','FAILED'), defaultValue: 'PENDING', field: 'GEOCODE_STATUS' },
    HAS_PV:          { type: DataTypes.BOOLEAN,     allowNull: true,  field: 'HAS_PV' },  // 생성열(Stored)
    HAS_ESS:         { type: DataTypes.BOOLEAN,     allowNull: true,  field: 'HAS_ESS' }, // 생성열(Stored)
    HAS_PCS:         { type: DataTypes.BOOLEAN,     allowNull: true,  field: 'HAS_PCS' }, // 생성열(Stored)
    ADMIN_ID:        { type: DataTypes.STRING(50),  allowNull: true,  field: 'ADMIN_ID' }, // FK → admin.ADMIN_ID
  }, {
    tableName: 'building_info',
    timestamps: false,
    underscored: false,
  });

  return BuildingInfo;
};
