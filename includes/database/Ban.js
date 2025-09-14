// includes/database/models/Ban.js

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
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Ban;
};
