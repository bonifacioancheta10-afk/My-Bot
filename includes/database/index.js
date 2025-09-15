const { Sequelize } = require("sequelize");
const { resolve } = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolve(__dirname, "../data.sqlite"),
  logging: false
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("[DB] ✅ Connection established.");

    await sequelize.sync();
    console.log("[DB] ✅ All models synced.");
  } catch (err) {
    console.error("[DB] ❌ Failed to connect to database:", err.message);
    process.exit(1); // wag tuloy pag talagang failed
  }
}

module.exports = { sequelize, connectDB };
