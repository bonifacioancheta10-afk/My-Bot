const fs = require("fs");
const path = require("path");
const axios = require("axios");

// File para sa permanent storage
const dataFile = path.join(__dirname, "../cache/lockedSettings.json");

// load existing data
let lockedSettings = {};
if (fs.existsSync(dataFile)) {
  try {
    lockedSettings = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (e) {
    console.error("⚠️ Error reading lockedSettings.json:", e);
    lockedSettings = {};
  }
}

// save function
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(lockedSettings, null, 2));
}

// Ensure cache folder exists
const cacheDir = path.join(__dirname, "../cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

module.exports.config = {
  name: "lockgroup",
  version: "1.3.0",
  hasPermssion: 2,
  credits: "ChatGPT",
  description: "Lock/unlock group name & photo",
  commandCategory: "group",
  usages: "lockgroup name <new name> | lockgroup photo (reply with photo) | lockgroup unlock",
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
      saveData();

      await api.setTitle(name, threadID);
      return api.sendMessage(`🔒 Group name locked to: "${name}"`, threadID);
    }

    case "photo": {
      if (!messageReply || !messageReply.attachments[0]) {
        return api.sendMessage("⚠️ Reply with a photo to lock!", threadID);
      }
      const photoUrl = messageReply.attachments[0].url;
      const savePath = path.join(cacheDir, `${threadID}_lockphoto.png`);

      try {
        const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, Buffer.from(res.data, "binary"));
      } catch (err) {
        return api.sendMessage("❌ Failed to download photo!", threadID);
      }

      lockedSettings[threadID] = lockedSettings[threadID] || {};
      lockedSettings[threadID].image = savePath;
      saveData();

      await api.changeGroupImage(fs.createReadStream(savePath), threadID);
      return api.sendMessage("🖼️ Group photo locked!", threadID);
    }

    case "unlock": {
      delete lockedSettings[threadID];
      saveData();
      return api.sendMessage("🔓 Group lock removed.", threadID);
    }

    default:
      return api.sendMessage("❗ Usage: lockgroup name/photo/unlock", threadID);
  }
};

module.exports.lockedSettings = lockedSettings;
module.exports.saveData = saveData;
