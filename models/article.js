// models/article.js
"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Article extends Model {
    static createArticle({ title, date, category, images }) {
      return this.create({
        title,
        date,
        category,
        images,
      });
    }

    static getArticles() {
      return this.findAll({
        order: [["id", "ASC"]],
      });
    }

    static getArticlesByCategory(selectedCategory) {
      return this.findAll({
        where: {
          category: selectedCategory,
        },
        order: [["id", "ASC"]],
      });
    }
  }

  Article.init(
    {
      title: DataTypes.STRING,
      date: DataTypes.DATE,
      category: DataTypes.STRING,
      images: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Article",
    }
  );

  return Article;
};
