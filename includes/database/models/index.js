const { DataTypes } = require("sequelize");

function initModels(sequelize) {
  const db = {};

  db.Bank = require("./bank")(sequelize, DataTypes);
  db.Ban = require("./ban")(sequelize, DataTypes);
  db.Check = require("./check")(sequelize, DataTypes);
  db.Currencies = require("./currencies")(sequelize, DataTypes);
  db.LockGroup = require("./lockGroup")(sequelize, DataTypes);
  db.Rules = require("./rules")(sequelize, DataTypes);
  db.Scammer = require("./scammer")(sequelize, DataTypes);
  db.Shop = require("./shop")(sequelize, DataTypes);
  db.Threads = require("./threads")(sequelize, DataTypes);
  db.Users = require("./users")(sequelize, DataTypes);

  return db;
}

module.exports = initModels;
