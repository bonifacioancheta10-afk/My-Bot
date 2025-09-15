module.exports = function (input) {
  const force = false;

  const Users = require("./models/users")(input);
  const Threads = require("./models/threads")(input);
  const Currencies = require("./models/currencies")(input);
  const Bans = require("./models/ban")(input);
  const Bank = require("./models/bank")(input);
  const Shop = require("./models/shop")(input);
  const Check = require("./models/check")(input);
  const LockGroup = require("./models/lockGroup")(input);
  const Rules = require("./models/rules")(input); // ✅

  Users.sync({ force });
  Threads.sync({ force });
  Currencies.sync({ force });
  Bans.sync({ force });
  Bank.sync({ force });
  Shop.sync({ force });
  Check.sync({ force });
  LockGroup.sync({ force });
  Rules.sync({ force }); // ✅

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
      Rules, // ✅
    },
    use: function (modelName) {
      return this.model[`${modelName}`];
    },
  };
};
