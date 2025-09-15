// === modules/commands/bank.js ===
const { sequelize } = require("../../database");
const initModels = require("../../database/models");
const models = initModels(sequelize);
const { Bank } = models;

module.exports.config = {
  name: "bank",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Jaylord",
  description: "Bank system with admin add + earn per message (DB based)",
  commandCategory: "Economy",
  usages: "/bank, /bank all, /bank add <uid> <amount>",
  cooldowns: 3,
};

// 🔑 Bot admins
const BOT_ADMINS = ["61559999326713"];

// Format balance
function formatBalance(user, balance) {
  return `🏦 Bank Account 🏦\n\n👤 ${user}\n💰 Balance: ${balance.toLocaleString()} coins`;
}

// 🔹 Auto add coins per normal message
module.exports.handleEvent = async function ({ event, Users }) {
  const { senderID, body } = event;
  if (!senderID || !body) return;

  if (body.trim().startsWith("/")) return;

  const [account] = await Bank.findOrCreate({
    where: { userID: senderID },
    defaults: { balance: 0 }
  });

  account.balance += 5;
  await account.save();
};

// 🔹 Run command
module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID } = event;

  const command = args[0]?.toLowerCase();

  // ✅ Show usage guide if wrong command
  const validArgs = ["", "all", "add"];
  if (!validArgs.includes(command)) {
    return api.sendMessage(
      "❌ Invalid usage.\n\n" +
      "📌 Correct Usage:\n" +
      "• /bank → check your balance\n" +
      "• /bank all → show all balances\n" +
      "• /bank add <uid> <amount> → add coins (admin only)",
      threadID
    );
  }

  // 📋 Show all accounts
  if (command === "all") {
    const accounts = await Bank.findAll();
    let arr = [];

    for (const acc of accounts) {
      let name;
      try {
        name = await Users.getNameUser(acc.userID);
      } catch {
        name = acc.userID;
      }
      arr.push({ name, balance: acc.balance });
    }

    arr.sort((a, b) => b.balance - a.balance);

    let msg = `📋 All Bank Accounts (Total: ${arr.length}) 📋\n`;
    arr.forEach((u, i) => {
      msg += `\n${i + 1}. ${u.name} - 💰 ${u.balance.toLocaleString()} coins`;
    });

    return api.sendMessage(msg, threadID);
  }

  // 🔑 Admin add coins
  if (command === "add") {
    if (!BOT_ADMINS.includes(senderID)) {
      return api.sendMessage("❌ Only bot admins can add coins.", threadID);
    }

    const targetUID = args[1];
    const amount = parseInt(args[2]);

    if (!targetUID || isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ Usage: /bank add <uid> <amount>", threadID);
    }

    const [account] = await Bank.findOrCreate({
      where: { userID: targetUID },
      defaults: { balance: 0 }
    });

    account.balance += amount;
    await account.save();

    let name;
    try {
      name = await Users.getNameUser(targetUID);
    } catch {
      name = targetUID;
    }

    return api.sendMessage(
      `✅ Added 💰 ${amount.toLocaleString()} coins to ${name}'s account.`,
      threadID
    );
  }

  // 📌 Default → show own balance
  const [account] = await Bank.findOrCreate({
    where: { userID: senderID },
    defaults: { balance: 0 }
  });

  let name;
  try {
    name = await Users.getNameUser(senderID);
  } catch {
    name = senderID;
  }

  return api.sendMessage(formatBalance(name, account.balance), threadID);
};
