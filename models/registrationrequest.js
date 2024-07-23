'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class RegistrationRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegistrationRequest.init({
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
    modelName: 'RegistrationRequest',
    tableName: 'registration_requests',
    underscored: true
  })
  return RegistrationRequest
}
