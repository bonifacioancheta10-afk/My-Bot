// includes/database/model.js
module.exports = function ({ sequelize, Sequelize }) {
  const force = false;

  // === Require lahat ng models ===
  const Users = require("./models/users")(sequelize, Sequelize);
  const Threads = require("./models/threads")(sequelize, Sequelize);
  const Currencies = require("./models/currencies")(sequelize, Sequelize);
  const Bans = require("./models/ban")(sequelize, Sequelize);
  const Bank = require("./models/bank")(sequelize, Sequelize);
  const Shop = require("./models/shop")(sequelize, Sequelize);
  const Check = require("./models/check")(sequelize, Sequelize);
  const LockGroup = require("./models/lockGroup")(sequelize, Sequelize);
  const Rules = require("./models/rules")(sequelize, Sequelize);
  const Scammer = require("./models/scammer")(sequelize, Sequelize);

  // === Auto sync lahat ng tables ===
  Users.sync({ force });
  Threads.sync({ force });
  Currencies.sync({ force });
  Bans.sync({ force });
  Bank.sync({ force });
  Shop.sync({ force });
  Check.sync({ force });
  LockGroup.sync({ force });
  Rules.sync({ force });
  Scammer.sync({ force });

  // === Return object para magamit sa commands ===
  return {
    model: {
      Users,
      Threads,
      Currencies,
      Bans,
      Bank,
      Shop,
      Check,
      LockGroup,
      Rules,
      Scammer,
    },
    use: function (modelName) {
      return this.model[`${modelName}`];
    },
  };
};
