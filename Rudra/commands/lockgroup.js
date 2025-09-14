// Sa lockgroup.js
const fs = require("fs");
const path = require("path");

const lockedSettings = {};

module.exports = {
  lockedSettings,
  config: {
    name: "lockgroup",
    version: "1.0.0",
    credits: "ChatGPT",
    description: "Lock group name and photo"
  },
  run: async ({ api, event, args }) => {
    const threadID = event.threadID;

    if (!args[0]) return api.sendMessage("Usage: /lock name | photo | all", threadID);

    if (!lockedSettings[threadID]) lockedSettings[threadID] = {};

    if (args[0] === "name" || args[0] === "all") {
      const info = await api.getThreadInfo(threadID);
      lockedSettings[threadID].name = info.threadName;
      api.sendMessage(`🔒 Locked group name: ${info.threadName}`, threadID);
    }

    if (args[0] === "photo" || args[0] === "all") {
      const imgPath = path.join(__dirname, `cache/${threadID}.png`);
      const info = await api.getThreadInfo(threadID);

      if (info.imageSrc) {
        const axios = require("axios");
        const res = await axios.get(info.imageSrc, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));

        lockedSettings[threadID].image = imgPath;
        api.sendMessage(`🔒 Locked group photo saved.`, threadID);
      } else {
        api.sendMessage("⚠ Walang group photo para i-lock.", threadID);
      }
    }
  }
};
