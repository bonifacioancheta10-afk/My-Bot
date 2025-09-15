// === modules/commands/lockgroup.js ===
const db = require("../../database");
const { LockGroup } = db;

module.exports.config = {
  name: "lockgroup",
  version: "2.0.1",
  role: 1,
  author: "ChatGPT",
  cooldowns: 5,
  description: "Lock group name (per GC)",
  usages: "/lockgroup name | /lockgroup remove"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("❗ Usage: /lockgroup name | remove", threadID, messageID);
  }

  if (args[0] === "name") {
    const info = await api.getThreadInfo(threadID);
    await LockGroup.upsert({ threadID, name: info.threadName });
    return api.sendMessage(
      `🔒 Group name is now locked to: "${info.threadName}"`,
      threadID,
      messageID
    );
  }

  if (args[0] === "remove") {
    await LockGroup.destroy({ where: { threadID } });
    return api.sendMessage("🔓 Group name lock removed.", threadID, messageID);
  }

  return api.sendMessage("❌ Invalid option. Use: name | remove", threadID, messageID);
};

// === Auto enforce lock ===
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID } = event;
  if (!threadID) return;

  const record = await LockGroup.findOne({ where: { threadID } });
  if (!record || !record.name) return;

  const info = await api.getThreadInfo(threadID);
  if (info.threadName !== record.name) {
    try {
      await api.setTitle(record.name, threadID);
      api.sendMessage(`⚠️ Group name is locked to: "${record.name}"`, threadID);
    } catch (e) {
      console.error("LockGroup error:", e);
    }
  }
};
