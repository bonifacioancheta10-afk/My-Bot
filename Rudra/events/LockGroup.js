const fs = require("fs");
const { lockedSettings, saveData } = require("../commands/lockgroup.js");

module.exports.config = {
  name: "lockgroupEvent",
  eventType: ["log:thread-name", "log:thread-icon"],
  version: "1.0.0",
  credits: "ChatGPT",
  description: "Auto-revert group name & photo when locked"
};

module.exports.run = async ({ api, event }) => {
  const { threadID, logMessageType } = event;
  const locked = lockedSettings[threadID];
  if (!locked) return;

  try {
    // restore locked name
    if (logMessageType === "log:thread-name" && locked.name) {
      await api.setTitle(locked.name, threadID);
      api.sendMessage(`⚠️ Group name is locked to: "${locked.name}"`, threadID);
    }

    // restore locked photo
    if (logMessageType === "log:thread-icon" && locked.image) {
      if (fs.existsSync(locked.image)) {
        await api.changeGroupImage(fs.createReadStream(locked.image), threadID);
        api.sendMessage("⚠️ Group photo is locked!", threadID);
      }
    }
  } catch (err) {
    console.error("Error restoring group setting:", err);
  }
};
