const fs = require("fs");
const path = require("path");

let lockedSettings = {}; // store locked group settings

module.exports.config = {
  name: "lockgroup",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "ChatGPT",
  description: "Lock/unlock group name & photo",
  commandCategory: "group",
  usages: "lockgroup name <new name> | lockgroup photo <reply photo> | lockgroup unlock",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageReply } = event;
  if (!args[0]) return api.sendMessage("❗ Usage: lockgroup name/photo/unlock", threadID);

  switch (args[0].toLowerCase()) {
    case "name": {
      const name = args.slice(1).join(" ");
      if (!name) return api.sendMessage("⚠️ Provide a group name!", threadID);

      lockedSettings[threadID] = lockedSettings[threadID] || {};
      lockedSettings[threadID].name = name;

      await api.setTitle(name, threadID);
      return api.sendMessage(`🔒 Group name locked to: "${name}"`, threadID);
    }

    case "photo": {
      if (!messageReply || !messageReply.attachments[0]) {
        return api.sendMessage("⚠️ Reply with a photo to lock!", threadID);
      }
      const photoUrl = messageReply.attachments[0].url;
      const savePath = path.join(__dirname, `cache/${threadID}_lockphoto.png`);

      // download image
      const axios = require("axios");
      const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(savePath, Buffer.from(res.data, "binary"));

      lockedSettings[threadID] = lockedSettings[threadID] || {};
      lockedSettings[threadID].image = savePath;

      await api.changeGroupImage(fs.createReadStream(savePath), threadID);
      return api.sendMessage("🖼️ Group photo locked!", threadID);
    }

    case "unlock": {
      delete lockedSettings[threadID];
      return api.sendMessage("🔓 Group lock removed.", threadID);
    }

    default:
      return api.sendMessage("❗ Usage: lockgroup name/photo/unlock", threadID);
  }
};

module.exports.lockedSettings = lockedSettings;
