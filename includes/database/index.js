const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

// Gumamit ng SQLite (pwede mo palitan depende sa DB mo)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "data.sqlite"),
  logging: false
});

const db = {};

// ✅ Tama na: "models" (plural) ang folder
const modelsDir = path.join(__dirname, "models");

fs.readdirSync(modelsDir)
  .filter(file => file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
