// src/models/User.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50), allowNull: false, unique: true
  },
  email: {
    type: DataTypes.STRING(100), allowNull: false, unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING, allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

module.exports = User;