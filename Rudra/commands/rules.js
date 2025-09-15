// === modules/commands/rules.js ===
const db = require("../../database");
const { Rules } = db;

module.exports.config = {
  name: "rules",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Manage group rules (per GC, saved in DB)",
  commandCategory: "Group",
  usages: "/rules | /rules add <text> | /rules remove <number>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const sub = args[0]?.toLowerCase();

  // 📌 Show all rules
  if (!sub) {
    const rules = await Rules.findAll({ where: { threadID } });

    if (rules.length === 0) {
      return api.sendMessage("📜 No rules set for this group yet.", threadID, messageID);
    }

    let msg = "📜 Group Rules:\n";
    rules.forEach((r, i) => {
      msg += `\n${i + 1}. ${r.rule}`;
    });

    return api.sendMessage(msg, threadID, messageID);
  }

  // 📌 Add new rule
  if (sub === "add") {
    const text = args.slice(1).join(" ");
    if (!text) {
      return api.sendMessage("❌ Usage: /rules add <text>", threadID, messageID);
    }

    await Rules.create({ threadID, rule: text });
    return api.sendMessage(`✅ Rule added: "${text}"`, threadID, messageID);
  }

  // 📌 Remove rule
  if (sub === "remove") {
    const index = parseInt(args[1]);
    if (isNaN(index)) {
      return api.sendMessage("❌ Usage: /rules remove <number>", threadID, messageID);
    }

    const rules = await Rules.findAll({ where: { threadID } });

    if (index < 1 || index > rules.length) {
      return api.sendMessage("⚠️ Invalid rule number.", threadID, messageID);
    }

    const toDelete = rules[index - 1];
    await toDelete.destroy();

    return api.sendMessage(`🗑️ Removed rule #${index}: "${toDelete.rule}"`, threadID, messageID);
  }

  // 📌 Invalid usage
  return api.sendMessage(
    "❌ Usage: /rules | /rules add <text> | /rules remove <number>",
    threadID,
    messageID
  );
};
