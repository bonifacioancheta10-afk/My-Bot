// === models/shop.js ===
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Shop = sequelize.define("Shop", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seller: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON, // array ng mga produkto/details
      defaultValue: [],
    },
  });

  return Shop;
};
