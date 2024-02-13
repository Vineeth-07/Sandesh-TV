"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static createNews({ title, content, state, category, date, image }) {
      return this.create({
        title,
        state,
        category,
        content,
        date,
        image,
      });
    }

    static getNews() {
      return this.findAll({
        order: [["id", "DESC"]],
      });
    }

    static getNewsByTodaysDate(todayDate) {
      return News.findAll({
        where: sequelize.literal(
          `to_char("News"."date", 'DD/MM/YYYY') = '${todayDate}'`
        ),
      });
    }

    static getLastSevenDaysNews() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const formattedDate = `${sevenDaysAgo
        .getDate()
        .toString()
        .padStart(2, "0")}/${(sevenDaysAgo.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${sevenDaysAgo.getFullYear()}`;
      return News.findAll({
        where: {
          date: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });
    }

    static updateNews(id, title, state, category, content) {
      return this.update(
        {
          title: title,
          state: state,
          category: category,
          content: content,
        },
        {
          where: { id: id },
        }
      );
    }

    static deleteNews(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static getNewsById(id) {
      return News.findOne({
        where: {
          id: id,
        },
      });
    }

    static getNewsByState(state) {
      return News.findAll({
        where: {
          state: state,
        },
      });
    }

    static getNewsByCategory(category) {
      return News.findAll({
        where: {
          category: category,
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
      state: DataTypes.STRING,
      category: DataTypes.STRING,
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
