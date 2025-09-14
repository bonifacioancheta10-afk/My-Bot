const fs = require("fs");
const path = require("path");

const LOCKS_PATH = path.join(__dirname, "../../../includes/database/nameLocks.json");
const OWNER_UID = "61559999326713"; // 🔒 BOT OWNER

module.exports.config = {
  name: "autosetname",
  version: "2.0",
  author: "Rudra | Modified by ChatGPT",
  countDown: 5,
  role: 0,
  shortDescription: "Lock/unlock user's nickname",
  longDescription: "Automatically enforce nickname lock in group chats",
  category: "moderation",
  guide: {
    en: `Usage:
      /autosetname lock @mention NewName
      /autosetname unlock @mention

Examples:
      /autosetname lock @Juan Dela Cruz KingOfGC
      /autosetname unlock @Juan Dela Cruz`
  }
};

// 🔹 Load saved locks
function loadLocks() {
  if (fs.existsSync(LOCKS_PATH)) {
    return JSON.parse(fs.readFileSync(LOCKS_PATH, "utf-8"));
  }
  return {};
}

// 🔹 Save locks
function saveLocks(locks) {
  fs.writeFileSync(LOCKS_PATH, JSON.stringify(locks, null, 2));
}

// 🔹 Command
module.exports.run = async function ({ api, event, args }) {
  if (event.senderID !== OWNER_UID) {
    return api.sendMessage("❌ Only the BOT OWNER can use this command.", event.threadID, event.messageID);
  }

  if (!args[0] || !event.mentions || Object.keys(event.mentions).length === 0) {
    return api.sendMessage(
      `⚠️ Wrong usage!\n\nExample:\n/autosetname lock @Juan Dela Cruz NewNickname\n/autosetname unlock @Juan Dela Cruz`,
      event.threadID,
      event.messageID
    );
  }

  const action = args[0].toLowerCase();
  const mentionedID = Object.keys(event.mentions)[0];
  const nameArgs = args.slice(1).join(" ").replace(/@.+?\s/, "").trim();

  let locks = loadLocks();
  const threadID = event.threadID;

  if (!locks[threadID]) locks[threadID] = {};

  if (action === "lock") {
    if (!nameArgs) {
      return api.sendMessage(
        "⚠️ You must provide a new nickname!\n\nExample:\n/autosetname lock @Juan Dela Cruz BagongNickname",
        threadID,
        event.messageID
      );
    }

    locks[threadID][mentionedID] = nameArgs;
    saveLocks(locks);

    api.changeNickname(nameArgs, threadID, mentionedID);
    return api.sendMessage(`🔒 Nickname locked to: ${nameArgs}`, threadID, event.messageID);
  }

  if (action === "unlock") {
    if (locks[threadID] && locks[threadID][mentionedID]) {
      delete locks[threadID][mentionedID];
      saveLocks(locks);
      return api.sendMessage("🔓 Nickname unlocked successfully.", threadID, event.messageID);
    } else {
      return api.sendMessage("⚠️ This user’s nickname was not locked.", threadID, event.messageID);
    }
  }

  return api.sendMessage(
    "❌ Invalid action!\n\nExample:\n/autosetname lock @Juan Dela Cruz NewNickname\n/autosetname unlock @Juan Dela Cruz",
    threadID,
    event.messageID
  );
};

// 🔹 Enforcer: Auto-revert nickname if changed
module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType === "log:thread-name-nickname") {
    let locks = loadLocks();
    const threadID = event.threadID;
    const targetID = event.logMessageData.participant_id;

    if (locks[threadID] && locks[threadID][targetID]) {
      const lockedName = locks[threadID][targetID];
      api.changeNickname(lockedName, threadID, targetID, (err) => {
        if (!err) {
          api.sendMessage(`🔒 Nickname reset back to: ${lockedName}`, threadID);
        }
      });
    }
  }
};
