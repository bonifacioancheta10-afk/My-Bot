// database/models/currencies.js
module.exports = (sequelize, DataTypes) => {
  const Currencies = sequelize.define("Currencies", {
    num: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.BIGINT,
      unique: true,
    },
    money: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    exp: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    data: {
      type: DataTypes.JSON,
    },
  });

  return Currencies;
};
