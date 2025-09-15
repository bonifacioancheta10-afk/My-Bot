// /includes/database/database.js
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

// Gumamit ng sqlite database file
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "data.sqlite"), // /includes/data.sqlite
  logging: false
});

const db = {};
const modelsDir = path.join(__dirname, "..", "models");

// I-load lahat ng models
fs.readdirSync(modelsDir)
  .filter(file => file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Function para i-connect ang DB at i-sync lahat ng models
async function connectDB() {
  try {
    await sequelize.sync();
    return db; // ibabalik lahat ng models kasama sequelize instance
  } catch (err) {
    throw err;
  }
}

module.exports = { connectDB };
