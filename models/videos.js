"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Videos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static createVideo({ title, url, video_id }) {
      return this.create({
        title,
        url,
        video_id,
      });
    }

    static getVideos() {
      return this.findAll({
        order: [["id", "DESC"]],
      });
    }
    static associate(models) {
      // define association here
    }
  }
  Videos.init(
    {
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      video_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Videos",
    }
  );
  return Videos;
};
