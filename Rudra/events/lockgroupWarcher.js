// lockgroupWatcher.js (events)
const fs = require("fs");
const { lockedSettings } = require("../commands/lockgroup.js");

module.exports.config = {
  name: "lockgroupWatcher",
  eventType: [],
  version: "1.0.0",
  credits: "ChatGPT",
  description: "Watchdog para ibalik ang locked photo"
};

module.exports.run = async ({ api, event }) => {
  // wala itong gagawin sa bawat event, pero magse-setup ng interval
};

// auto-check every 30 seconds
setInterval(async () => {
  try {
    for (const threadID in lockedSettings) {
      const locked = lockedSettings[threadID];
      if (locked.image && fs.existsSync(locked.image)) {
        const info = await global.api.getThreadInfo(threadID);
        const currentPhoto = info.imageSrc || "";

        // kung nagbago ang photo, ibalik yung naka-lock
        if (currentPhoto !== "" && !currentPhoto.includes("cache")) {
          try {
            await global.api.changeGroupImage(fs.createReadStream(locked.image), threadID);
            global.api.sendMessage("⏪ Restored locked group photo.", threadID);
          } catch (err) {
            console.error("Restore photo error:", err);
          }
        }
      }
    }
  } catch (err) {
    console.error("Watcher error:", err);
  }
}, 30000); // 30 seconds interval
