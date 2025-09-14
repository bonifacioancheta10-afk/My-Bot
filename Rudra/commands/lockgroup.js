const fs = require("fs");
const path = require("path");

const lockedSettings = {}; // dito sine-save lahat ng naka-lock

module.exports.config = {
  name: "lockgroup",
  version: "1.0.1",
  credits: "ChatGPT",
  description: "Lock specific group settings (name, photo, etc.)",
  usages: "[name/photo]",
  cooldown: 5,
};

module.exports.lockedSettings = lockedSettings;

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "⚙️ Usage:\n/lockgroup name → lock group name\n/lockgroup photo → lock group photo",
      threadID,
      messageID
    );
  }

  const type = args[0].toLowerCase();
  if (!lockedSettings[threadID]) lockedSettings[threadID] = {};

  switch (type) {
    case "name": {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        lockedSettings[threadID].name = threadInfo.threadName;
        api.sendMessage(`🔒 Group name locked to: "${threadInfo.threadName}"`, threadID, messageID);
      } catch (err) {
        console.error(err);
        api.sendMessage("⚠ Error while locking group name.", threadID, messageID);
      }
      break;
    }

    case "photo": {
      try {
        const cachePath = path.join(__dirname, "cache");
        if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

        const photoPath = path.join(cachePath, `group_photo_${threadID}.png`);

        // kunin latest group image
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo.imageSrc) {
          return api.sendMessage("⚠ No group photo found to lock.", threadID, messageID);
        }

        // i-download yung current photo
        const request = require("request");
        request(threadInfo.imageSrc)
          .pipe(fs.createWriteStream(photoPath))
          .on("close", () => {
            lockedSettings[threadID].image = photoPath;
            api.sendMessage("🖼️ Group photo locked!", threadID, messageID);
          });
      } catch (err) {
        console.error(err);
        api.sendMessage("⚠ Error while locking group photo.", threadID, messageID);
      }
      break;
    }

    default:
      api.sendMessage(
        "⚠ Invalid type.\nOptions: name / photo",
        threadID,
        messageID
      );
      break;
  }
};
