// database/models/bank.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Bank = sequelize.define("Bank", {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  return Bank;
};
