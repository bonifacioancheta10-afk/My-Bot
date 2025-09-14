const fs = require("fs");
const path = require("path");
const axios = require("axios");

// memory storage for locked groups
let lockedSettings = {};

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

  if (!args[0]) {
    return api.sendMessage("❗ Usage: lockgroup name/photo/unlock", threadID);
  }

  switch (args[0].toLowerCase()) {
    // lock group name
    case "name": {
      const name = args.slice(1).join(" ");
      if (!name) return api.sendMessage("⚠️ Provide a group name!", threadID);

      lockedSettings[threadID] = lockedSettings[threadID] || {};
      lockedSettings[threadID].name = name;

      try {
        await api.setTitle(name, threadID);
        return api.sendMessage(`🔒 Group name locked to: "${name}"`, threadID);
      } catch {
        return api.sendMessage("⚠️ Bot is not admin, cannot set name!", threadID);
      }
    }

    // lock group photo
    case "photo": {
      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage("⚠️ Reply with a photo to lock!", threadID);
      }

      const attachment = messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("⚠️ Please reply to a valid photo!", threadID);
      }

      const photoUrl = attachment.url;
      const savePath = path.join(__dirname, `../cache/${threadID}_lockphoto.png`);

      try {
        const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, Buffer.from(res.data, "binary"));

        lockedSettings[threadID] = lockedSettings[threadID] || {};
        lockedSettings[threadID].image = savePath;

        await api.changeGroupImage(fs.createReadStream(savePath), threadID);
        return api.sendMessage("🖼️ Group photo locked!", threadID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("⚠️ Failed to save or set the photo!", threadID);
      }
    }

    // unlock everything
    case "unlock": {
      delete lockedSettings[threadID];
      return api.sendMessage("🔓 Group lock removed.", threadID);
    }

    default:
      return api.sendMessage("❗ Usage: lockgroup name/photo/unlock", threadID);
  }
};

// export para ma-access sa events
module.exports.lockedSettings = lockedSettings;
