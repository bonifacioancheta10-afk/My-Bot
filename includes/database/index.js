const Sequelize = require("sequelize");
const { resolve } = require("path");
const { DATABASE } = global.config;

let dialect = Object.keys(DATABASE)[0];
let storage = resolve(__dirname, `../${DATABASE[dialect].storage}`);

const sequelize = new Sequelize({
  dialect,
  storage,
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 20000
  },
  retry: {
    match: [/SQLITE_BUSY/],
    name: "query",
    max: 20
  },
  logging: false,
  transactionType: "IMMEDIATE",
  define: {
    underscored: false,
    freezeTableName: true,
    charset: "utf8",
    dialectOptions: {
      collate: "utf8_general_ci"
    },
    timestamps: true
  },
  sync: {
    force: false
  }
});

async function connectWithRetry(retries = 5) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("[DB] ✅ Connection established.");

      await sequelize.sync();
      console.log("[DB] ✅ All models synced.");
      return;
    } catch (err) {
      retries -= 1;
      console.error(`[DB] ❌ Connection failed. Retries left: ${retries}`, err);
      if (retries > 0) {
        await new Promise(res => setTimeout(res, 5000)); // wait 5s before retry
      }
    }
  }
  console.error("[DB] ❌ Could not connect after retries.");
}

connectWithRetry();

module.exports = { sequelize, Sequelize };
