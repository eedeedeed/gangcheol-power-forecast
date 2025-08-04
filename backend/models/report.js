// models/report.js
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
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
    }
  }, {
    tableName: 'reports',
    timestamps: true
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Report;
};
