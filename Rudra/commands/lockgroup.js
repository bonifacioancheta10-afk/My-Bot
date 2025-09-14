const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 🔒 Store locked settings per group
let lockedSettings = {};

module.exports.config = {
  name: "lockgroup",
  version: "1.2.0",
  hasPermssion: 2,
  credits: "ChatGPT",
  description: "Lock/unlock group name & photo",
  commandCategory: "group",
  usages: "/lockgroup name <new name>\n/lockgroup photo (reply to photo)\n/lockgroup unlock",
  cooldowns: 5
};

// 🛠 Ensure cache folder exists
const cacheDir = path.join(__dirname, "../../cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageReply } = event;

  try {
    if (!args[0]) {
      return api.sendMessage(
        "❗ Usage:\n" +
        "- /lockgroup name <new name>\n" +
        "- /lockgroup photo (reply with photo)\n" +
        "- /lockgroup unlock",
        threadID
      );
    }

    switch (args[0].toLowerCase()) {
      // 🔒 Lock group name
      case "name": {
        const name = args.slice(1).join(" ");
        if (!name) return api.sendMessage("⚠️ Provide a group name!", threadID);

        lockedSettings[threadID] = lockedSettings[threadID] || {};
        lockedSettings[threadID].name = name;

        await api.setTitle(name, threadID);
        return api.sendMessage(`🔒 Group name locked to: "${name}"`, threadID);
      }

      // 🔒 Lock group photo
      case "photo": {
        if (!messageReply || !messageReply.attachments || !messageReply.attachments[0]) {
          return api.sendMessage("⚠️ Reply with a photo to lock!", threadID);
        }

        const photoUrl = messageReply.attachments[0].url;
        const savePath = path.join(cacheDir, `${threadID}_lockphoto.png`);

        // download image
        const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, Buffer.from(res.data, "binary"));

        lockedSettings[threadID] = lockedSettings[threadID] || {};
        lockedSettings[threadID].image = savePath;

        await api.changeGroupImage(fs.createReadStream(savePath), threadID);
        return api.sendMessage("🖼️ Group photo locked!", threadID);
      }

      // 🔓 Unlock
      case "unlock": {
        delete lockedSettings[threadID];
        return api.sendMessage("🔓 Group lock removed.", threadID);
      }

      default:
        return api.sendMessage("❗ Invalid option. Use: name/photo/unlock", threadID);
    }
  } catch (err) {
    console.error("❌ Lockgroup error:", err);
    return api.sendMessage("⚠ Nagka-error sa lockgroup command. Check console logs.", threadID);
  }
};

// 📤 Export settings para magamit ng event listener
module.exports.lockedSettings = lockedSettings;
