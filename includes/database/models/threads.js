// models/threads.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Threads = sequelize.define("Threads", {
    num: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    threadID: {
      type: DataTypes.BIGINT,
      unique: true,
    },
    threadInfo: {
      type: DataTypes.JSON,
    },
    data: {
      type: DataTypes.JSON,
    },
  });

  return Threads;
};
