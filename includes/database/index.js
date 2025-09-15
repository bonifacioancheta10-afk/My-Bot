// includes/database/index.js
const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

const sequelize = new Sequelize({
  dialect: "sqlite", // gamit mo sqlite, kaya ito
  storage: path.join(process.cwd(), "data.sqlite"),
  logging: false,
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");

    // Load lahat ng models sa includes/database/model/
    const db = {};
    const modelsPath = path.join(__dirname, "model");

    fs.readdirSync(modelsPath).forEach((file) => {
      if (file.endsWith(".js")) {
        const model = require(path.join(modelsPath, file))(sequelize);
        db[model.name] = model;
      }
    });

    // Attach sequelize instance
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    // Sync all models (auto-create tables kung wala pa)
    await sequelize.sync();
    console.log("✅ Models synchronized!");

    return db;
  } catch (err) {
    console.error("❌ Database connection error:", err);
    throw err;
  }
}

module.exports = { connectDB, sequelize, Sequelize };
