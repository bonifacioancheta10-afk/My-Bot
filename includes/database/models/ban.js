const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Ban = sequelize.define("Ban", {
    userID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    threadID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Ban;
};
