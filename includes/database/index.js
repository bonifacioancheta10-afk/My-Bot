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

// 🛠 Always sync on start
(async () => {
    try {
        await sequelize.authenticate();
        console.log("[DB] ✅ Connection established.");
        await sequelize.sync({ force: false }); // auto create/update tables
        console.log("[DB] ✅ All models synced.");
    } catch (err) {
        console.error("[DB] ❌ Error:", err);
    }
})();

module.exports = { sequelize, Sequelize };
