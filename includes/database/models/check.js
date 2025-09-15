// models/check.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Check = sequelize.define("Check", {
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Check;
};
