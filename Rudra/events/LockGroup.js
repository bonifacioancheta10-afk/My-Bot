const fs = require("fs");
const { lockedSettings } = require("../commands/lockgroup.js"); // adjust path kung iba

module.exports.config = {
  name: "lockgroupEvent",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "1.0.2",
  credits: "ChatGPT"
};

module.exports.run = async ({ api, event }) => {
  const { threadID, logMessageType, logMessageData } = event;
  if (!lockedSettings[threadID]) return;

  const locked = lockedSettings[threadID];

  // 🔒 Restore group name
  if (logMessageType === "log:thread-name") {
    if (locked.name && logMessageData?.name !== locked.name) {
      try {
        await api.setTitle(locked.name, threadID);
        return api.sendMessage(`⏪ Restored group name: "${locked.name}"`, threadID);
      } catch (err) {
        console.error("Error restoring name:", err);
        return api.sendMessage("⚠ Bot is not admin. Cannot restore name!", threadID);
      }
    }
  }

  // 🖼 Restore group photo
  if (logMessageType === "log:thread-icon" || logMessageType === "log:thread-image") {
    if (locked.image && fs.existsSync(locked.image)) {
      try {
        await api.changeGroupImage(fs.createReadStream(locked.image), threadID);
        return api.sendMessage("⏪ Restored locked group photo.", threadID);
      } catch (err) {
        console.error("Error restoring photo:", err);
        return api.sendMessage("⚠ Bot is not admin. Cannot restore photo!", threadID);
      }
    }
  }
};
