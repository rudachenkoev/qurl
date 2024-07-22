'use strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PasswordRecoveryRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PasswordRecoveryRequest.init({
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    verification_code: {
      allowNull: false,
      type: DataTypes.STRING(6)
    }
  }, {
    sequelize,
    modelName: 'PasswordRecoveryRequest',
    tableName: 'password_recovery_requests',
    underscored: true
  })
  return PasswordRecoveryRequest
}
