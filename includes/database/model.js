const { DataTypes } = require("sequelize");

module.exports = ({ sequelize, Sequelize }) => {
  const db = {};

  // === Bank Model ===
  db.Bank = sequelize.define("Bank", {
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

  // === Ban Model ===
  db.Ban = sequelize.define("Ban", {
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

  // === LockGroup Model ===
  db.LockGroup = sequelize.define("LockGroup", {
    threadID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};
