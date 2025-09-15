const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "data.sqlite"), // file: /includes/data.sqlite
  logging: false
});

const db = {};
const modelsDir = path.join(__dirname, "..", "models");

// Load lahat ng models
fs.readdirSync(modelsDir)
  .filter(file => file.endsWith(".js"))
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Ito yung function na tatawagin sa rudra.js
async function connectDB() {
  try {
    await sequelize.sync();
    return db; // ibabalik lahat ng models + sequelize instance
  } catch (err) {
    throw err;
  }
}

module.exports = { connectDB };
