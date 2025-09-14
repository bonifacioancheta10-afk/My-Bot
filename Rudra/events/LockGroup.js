const fs = require("fs");
const { lockedSettings } = require("../commands/lockgroup.js"); // adjust path kung iba

module.exports.config = {
  name: "lockgroupEvent",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "1.2.0",
  credits: "ChatGPT",
  description: "Auto-restore locked group name & photo"
};

module.exports.run = async ({ api, event }) => {
  const { threadID, logMessageType, logMessageData } = event;

  // skip kung walang naka-lock sa group na 'to
  if (!lockedSettings[threadID]) return;
  const locked = lockedSettings[threadID];

  try {
    // 🔹 Restore name kung binago
    if (logMessageType === "log:thread-name") {
      if (locked.name && logMessageData?.name !== locked.name) {
        try {
          await api.setTitle(locked.name, threadID);
          return api.sendMessage(`⏪ Restored locked group name: "${locked.name}"`, threadID);
        } catch (err) {
          console.error("❌ Error restoring name:", err);
          return api.sendMessage("⚠ Bot is not admin. Cannot restore group name!", threadID);
        }
      }
    }

    // 🔹 Restore photo kung binago
    if (logMessageType === "log:thread-icon" || logMessageType === "log:thread-image") {
      if (locked.image && fs.existsSync(locked.image)) {
        try {
          await api.changeGroupImage(fs.createReadStream(locked.image), threadID);
          return api.sendMessage("⏪ Restored locked group photo.", threadID);
        } catch (err) {
          console.error("❌ Error restoring photo:", err);
          return api.sendMessage("⚠ Bot is not admin. Cannot restore group photo!", threadID);
        }
      }
    }
  } catch (err) {
    console.error("❌ Event handler error:", err);
  }
};
