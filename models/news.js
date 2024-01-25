"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static createNews({ title, content, date, image }) {
      return this.create({
        title,
        content,
        date,
        image,
      });
    }

    static getNews() {
      return this.findAll({
        order: [["id", "ASC"]],
      });
    }

    static getNewsByTodaysDate(todayDate) {
      return News.findAll({
        where: sequelize.literal(
          `to_char("News"."date", 'DD/MM/YYYY') = '${todayDate}'`
        ),
      });
    }

    static getNewsById(id) {
      return News.findOne({
        where: {
          id: id,
        },
      });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  News.init(
    {
      title: DataTypes.TEXT,
      content: DataTypes.TEXT,
      date: DataTypes.DATE,
      image: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "News",
    }
  );
  return News;
};
