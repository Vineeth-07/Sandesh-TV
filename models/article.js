// models/article.js
"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Article extends Model {
    static createArticle({ title, date, category, images, state }) {
      return this.create({
        title,
        date,
        category,
        images,
        state,
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

    static getArticlesByStateAndCategory(selectedCategory,selectedState){
      return this.findAll({
        where : {
          category: selectedCategory,
          state : selectedState
        },
        order : [["id","ASC"]]
      })
    }

    static getArticleById(articleId) {
      return this.findAll({
        where: {
          id: articleId,
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
      state: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Article",
    }
  );

  return Article;
};
