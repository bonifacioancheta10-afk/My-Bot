// === models/ban.js ===
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ban = sequelize.define("Ban", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Ban;
};
