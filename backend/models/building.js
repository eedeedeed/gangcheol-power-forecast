module.exports = (sequelize, DataTypes) => {
  const BuildingInfo = sequelize.define('BuildingInfo', {
    building_id: {                        // ← 소문자 속성
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'BUILDING_ID',              // ← DB 컬럼
    },

    building_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'BUILDING_NAME',
    },

    building_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'BUILDING_TYPE',
    },

    building_address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'BUILDING_ADDRESS',
    },

    total_area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'TOTAL_AREA',
    },

    cooling_area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'COOLING_AREA',
    },

    // 생성 칼럼(읽기 전용)
    cooling_ratio: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'COOLING_RATIO',
      set() { throw new Error('cooling_ratio is generated and read-only'); }
    },

    pv_capacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      field: 'PV_CAPACITY',
    },
    ess_capacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      field: 'ESS_CAPACITY',
    },
    pcs_capacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      field: 'PCS_CAPACITY',
    },

    // 생성 칼럼(읽기 전용)
    has_pv:  { type: DataTypes.BOOLEAN, allowNull: true, field: 'HAS_PV',  set() { throw new Error('has_pv is read-only'); } },
    has_ess: { type: DataTypes.BOOLEAN, allowNull: true, field: 'HAS_ESS', set() { throw new Error('has_ess is read-only'); } },
    has_pcs: { type: DataTypes.BOOLEAN, allowNull: true, field: 'HAS_PCS', set() { throw new Error('has_pcs is read-only'); } },

    latitude:  { type: DataTypes.DECIMAL(10,7), allowNull: true, field: 'LATITUDE'  },
    longitude: { type: DataTypes.DECIMAL(10,7), allowNull: true, field: 'LONGITUDE' },
    nx:        { type: DataTypes.SMALLINT,      allowNull: true, field: 'NX'        },
    ny:        { type: DataTypes.SMALLINT,      allowNull: true, field: 'NY'        },

    geocode_status: {
      type: DataTypes.ENUM('PENDING','OK','FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
      field: 'GEOCODE_STATUS',
    },
  }, {
    tableName: 'building_info',
    timestamps: false,
  });

  return BuildingInfo;
};
