// === models/lockGroup.js ===
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LockGroup = sequelize.define("LockGroup", {
    threadID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  return LockGroup;
};
