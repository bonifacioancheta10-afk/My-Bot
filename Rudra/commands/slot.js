// === modules/commands/slot.js ===
module.exports.config = {
  name: "slot",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "🎰 Slot machine game (bet your coins)",
  commandCategory: "Economy",
  usages: "/slot <amount>",
  cooldowns: 5
};

const symbols = ["🍒", "🍋", "🍇", "🍉", "⭐", "7️⃣"];

module.exports.run = async function ({ api, event, args, models, Users }) {
  const { threadID, senderID, messageID } = event;
  const Bank = models.use("Bank");

  // check bet amount
  const bet = parseInt(args[0]);
  if (!bet || bet <= 0) {
    return api.sendMessage("❌ Usage: /slot <amount>", threadID, messageID);
  }

  // fetch user account
  let user = await Bank.findOne({ where: { userID: senderID } });
  if (!user) {
    user = await Bank.create({ userID: senderID, balance: 0 });
  }

  if (user.balance < bet) {
    return api.sendMessage("💸 Not enough coins in your bank account.", threadID, messageID);
  }

  // spin slots
  const slotResult = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  // check outcome
  let win = 0;
  if (slotResult[0] === slotResult[1] && slotResult[1] === slotResult[2]) {
    if (slotResult[0] === "7️⃣") win = bet * 10; // Jackpot!
    else win = bet * 5;
  } else if (slotResult[0] === slotResult[1] || slotResult[1] === slotResult[2] || slotResult[0] === slotResult[2]) {
    win = bet * 2; // 2 same
  }

  // update balance
  let msg = `🎰 SLOT MACHINE 🎰\n[ ${slotResult.join(" | ")} ]\n\n`;
  if (win > 0) {
    user.balance = user.balance - bet + win;
    msg += `✅ You won 💰 ${win.toLocaleString()} coins!\n`;
  } else {
    user.balance -= bet;
    msg += `❌ You lost 💸 ${bet.toLocaleString()} coins.\n`;
  }

  await user.save();

  const name = await Users.getNameUser(senderID);
  msg += `\n👤 ${name}\n💰 Current Balance: ${user.balance.toLocaleString()} coins`;

  return api.sendMessage(msg, threadID, messageID);
};
