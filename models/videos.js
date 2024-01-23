"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Videos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static createVideo({ title, url }) {
      return this.create({
        title,
        url,
      });
    }

    static getVideos() {
      return this.findAll({
        order: [["id", "ASC"]],
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
    },
    {
      sequelize,
      modelName: "Videos",
    }
  );
  return Videos;
};
