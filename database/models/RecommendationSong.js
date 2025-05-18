const { Model, DataTypes } = require("sequelize");
const sequelize            = require("../config");
const Recommendation       = require("./Recommendation");

class RecommendationSong extends Model {}

RecommendationSong.init({
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
  },
  title:   DataTypes.STRING,
  artist:  DataTypes.STRING,
  url:     DataTypes.STRING,
  genre:   DataTypes.STRING
}, {
  sequelize,
  modelName: "RecommendationSong",
  tableName: "recommendation_songs",
  timestamps: false
});

RecommendationSong.belongsTo(Recommendation, { foreignKey: "recommendationId" });
Recommendation.hasMany(RecommendationSong, { foreignKey: "recommendationId" });

module.exports = RecommendationSong;
