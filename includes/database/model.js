module.exports = function (input) {
  const force = false;

  const Users = require("./models/users")(input);
  const Threads = require("./models/threads")(input);
  const Currencies = require("./models/currencies")(input);
  const Bank = require("./models/bank")(input);   // ✅ Bank model
  const Ban = require("./models/ban")(input);     // ✅ Ban model

  Users.sync({ force });
  Threads.sync({ force });
  Currencies.sync({ force });
  Bank.sync({ force });
  Ban.sync({ force });

  return {
    model: {
      Users,
      Threads,
      Currencies,
      Bank,
      Ban
    },
    use: function (modelName) {
      return this.model[`${modelName}`];
    }
  }
}
