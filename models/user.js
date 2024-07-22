'use strict'
const { Model } = require('sequelize')
const { generatePasswordHash } = require('../helpers/auth')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Session, { foreignKey: 'user_id' })
    }
  }
  User.init({
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('password', generatePasswordHash(value))
      }
    },
    is_active: {
      defaultValue: true,
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
  });
  return User
}
