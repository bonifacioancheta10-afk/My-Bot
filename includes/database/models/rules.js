// models/rules.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rules = sequelize.define("Rules", {
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rule: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Rules;
};
