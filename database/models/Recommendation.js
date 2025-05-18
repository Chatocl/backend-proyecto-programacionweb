const { Model, DataTypes } = require("sequelize");
const sequelize            = require("../config");
const User                 = require("./User");

class Recommendation extends Model {}

Recommendation.init({
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  },
  emotion: {
    type: DataTypes.STRING(20), allowNull: false
  }
}, {
  sequelize,
  modelName: "Recommendation",
  tableName: "recommendations",
  timestamps: true
});

Recommendation.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Recommendation, { foreignKey: "userId" });

module.exports = Recommendation;
