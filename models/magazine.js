"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Magazine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static createMagazine({ title, date, pdf }) {
      return this.create({
        title,
        date,
        pdf,
      });
    }

    static getMagazines() {
      return this.findAll({
        order: [["id", "DESC"]],
      });
    }

    static getMagazineById(id) {
      return Magazine.findOne({
        where: {
          id: id,
        },
      });
    }

    static associate(models) {
      // define association here
    }
  }
  Magazine.init(
    {
      title: DataTypes.STRING,
      date: DataTypes.DATE,
      pdf: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Magazine",
    }
  );
  return Magazine;
};
