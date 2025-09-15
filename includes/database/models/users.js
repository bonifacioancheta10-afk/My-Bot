// === models/users.js ===
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Users = sequelize.define("Users", {
    num: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  });

  return Users;
};
