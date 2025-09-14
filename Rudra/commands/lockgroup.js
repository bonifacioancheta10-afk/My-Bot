const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "lockgroup",
    version: "1.0.0",
    role: 1,
    author: "ChatGPT",
    cooldowns: 5,
    description: "Lock group name or photo",
    usages: "/lockgroup name | /lockgroup photo (reply to image)"
};

const lockFile = path.join(__dirname, "lockData.json");

// helper para magbasa/sulat ng lock data
function getLockData() {
    if (!fs.existsSync(lockFile)) return {};
    return JSON.parse(fs.readFileSync(lockFile, "utf8"));
}
function saveLockData(data) {
    fs.writeFileSync(lockFile, JSON.stringify(data, null, 2));
}

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    const option = args[0];

    if (!option) {
        return api.sendMessage("❗ Usage: /lockgroup name | photo", threadID, messageID);
    }

    let data = getLockData();
    if (!data[threadID]) data[threadID] = {};

    if (option === "name") {
        const info = await api.getThreadInfo(threadID);
        data[threadID].name = info.threadName;
        saveLockData(data);
        return api.sendMessage(`🔒 Group name is locked to: "${info.threadName}"`, threadID, messageID);
    }

    if (option === "photo") {
        // dapat reply ito sa photo
        if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
            return api.sendMessage("⚠️ Please reply to a photo to lock as group photo!", threadID, messageID);
        }
        try {
            const photoUrl = messageReply.attachments[0].url;
            const photoPath = path.join(__dirname, `photo_${threadID}.jpg`);

            // download image
            const axios = require("axios");
            const res = await axios.get(photoUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(photoPath, Buffer.from(res.data, "binary"));

            data[threadID].photo = photoPath;
            saveLockData(data);

            return api.sendMessage("🖼️ Group photo locked!", threadID, messageID);
        } catch (e) {
            return api.sendMessage("⚠️ Failed to save or set the photo!", threadID, messageID);
        }
    }

    return api.sendMessage("❌ Invalid option. Use: name | photo", threadID, messageID);
};
