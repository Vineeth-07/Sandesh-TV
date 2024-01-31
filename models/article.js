// models/article.js
"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Article extends Model {
    static createArticle({ title, date, images, state }) {
      return this.create({
        title,
        date,
        images,
        state,
      });
    }

    static updateArticle(id, title, state) {
      return this.update(
        {
          title: title,
          state: state,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }

    static deleteArticle(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static getArticles() {
      return this.findAll({
        order: [["id", "DESC"]],
      });
    }

    static getArticlesByState(state) {
      return this.findAll({
        where: {
          state: state,
        },
        order: [["id", "DESC"]],
      });
    }

    static getArticleById(articleId) {
      return this.findOne({
        where: {
          id: articleId,
        },
        order: [["id", "DESC"]],
      });
    }
  }

  Article.init(
    {
      title: DataTypes.STRING,
      date: DataTypes.DATE,
      images: DataTypes.JSONB,
      state: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Article",
    }
  );

  return Article;
};
