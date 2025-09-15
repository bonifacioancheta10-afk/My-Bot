const Sequelize = require("sequelize");
const { resolve } = require("path");
const fs = require("fs");
const { DATABASE } = global.config;

let dialect = Object.keys(DATABASE)[0]; 
let storage = resolve(__dirname, `../${DATABASE[dialect].storage}`);

// 🛠 Auto-create database file kung wala pa
let isNewDB = false;
if (dialect === "sqlite" && !fs.existsSync(storage)) {
    fs.writeFileSync(storage, "");
    console.log(`[DB] Created new database file: ${storage}`);
    isNewDB = true;
}

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

// 🛠 Kung bagong DB, auto-sync lahat ng models
(async () => {
    try {
        await sequelize.authenticate();
        console.log("[DB] Connection established.");
        if (isNewDB) {
            await sequelize.sync({ force: false });
            console.log("[DB] All tables synced (auto-create).");
        }
    } catch (err) {
        console.error("[DB] Error:", err);
    }
})();

module.exports = { sequelize, Sequelize };
