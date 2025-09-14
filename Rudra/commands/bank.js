module.exports.config = {
  name: "bank",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Jaylord",
  description: "Bank system with admin add, reset and auto earn feature",
  commandCategory: "Economy",
  usages: "/bank, /bank all, /bank add <uid> <amount>, /bank reset",
  cooldowns: 3,
};

// 🔑 Bot admins
const BOT_ADMINS = ["61559999326713"];

// Format balance
function formatBalance(user, balance) {
  return `🏦 Bank Account 🏦\n\n👤 ${user}\n💰 Balance: ${balance.toLocaleString()} coins`;
}

// 🔹 Add 5 coins per normal message
module.exports.handleEvent = async function ({ event }) {
  const { senderID, body } = event;
  if (!senderID || !body) return;
  if (body.trim().startsWith("/")) return; // skip commands

  const Bank = global.db.use("Bank");

  let account = await Bank.findOne({ where: { userID: senderID } });
  if (!account) {
    account = await Bank.create({ userID: senderID, balance: 0 });
  }

  account.balance += 5;
  await account.save();
};

// 🔹 Run command
module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID } = event;
  const Bank = global.db.use("Bank");

  let account = await Bank.findOne({ where: { userID: senderID } });
  if (!account) {
    account = await Bank.create({ userID: senderID, balance: 0 });
  }

  const command = args[0]?.toLowerCase();

  // 🔹 Show all accounts
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

  // 🔹 Admin-only: add money
  if (command === "add") {
    if (!BOT_ADMINS.includes(senderID)) {
      return api.sendMessage("❌ Only bot admins can add coins.", threadID);
    }

    const targetUID = args[1];
    const amount = parseInt(args[2]);

    if (!targetUID || isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ Usage: /bank add <uid> <amount>", threadID);
    }

    let targetAcc = await Bank.findOne({ where: { userID: targetUID } });
    if (!targetAcc) {
      targetAcc = await Bank.create({ userID: targetUID, balance: 0 });
    }

    targetAcc.balance += amount;
    await targetAcc.save();

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

  // 🔹 Admin-only: reset all
  if (command === "reset") {
    if (!BOT_ADMINS.includes(senderID)) {
      return api.sendMessage("❌ Only bot admins can reset the bank database.", threadID);
    }

    await Bank.destroy({ where: {} }); // delete all records
    return api.sendMessage("🔄 All bank accounts have been reset.", threadID);
  }

  // 🔹 Default: show own balance
  let name;
  try {
    name = await Users.getNameUser(senderID);
  } catch {
    name = senderID;
  }

  return api.sendMessage(formatBalance(name, account.balance), threadID);
};
