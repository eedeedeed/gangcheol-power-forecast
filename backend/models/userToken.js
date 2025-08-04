// models/userToken.js
module.exports = (sequelize, DataTypes) => {
  const UserToken = sequelize.define('UserToken', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_tokens',
    timestamps: false
  });

  UserToken.associate = (models) => {
    UserToken.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return UserToken;
};
