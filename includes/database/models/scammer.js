// models/scammer.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Scammer = sequelize.define("Scammer", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addedBy: {
      type: DataTypes.STRING, // UID ng nag-add
      allowNull: false,
    },
  });

  return Scammer;
};
