module.exports = function (input) {
	const force = false;

	// Import ng lahat ng models
	const Users = require("./models/users")(input);
	const Threads = require("./models/threads")(input);
	const Currencies = require("./models/currencies")(input);
	const Ban = require("./models/ban")(input); // ✅ bagong ban model

	// Sync lahat ng tables (auto create kung wala pa)
	Users.sync({ force });
	Threads.sync({ force });
	Currencies.sync({ force });
	Ban.sync({ force });

	return {
		model: {
			Users,
			Threads,
			Currencies,
			Ban
		},
		use: function (modelName) {
			return this.model[`${modelName}`];
		}
	}
}
