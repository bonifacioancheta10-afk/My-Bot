const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "lockgroupUpdate",
    eventType: ["log:thread-name", "log:thread-icon"],
    version: "1.0.0",
    author: "ChatGPT",
    description: "Auto-restore locked group name or photo"
};

const lockFile = path.join(__dirname, "lockData.json");

function getLockData() {
    if (!fs.existsSync(lockFile)) return {};
    return JSON.parse(fs.readFileSync(lockFile, "utf8"));
}

module.exports.run = async function({ api, event }) {
    const { threadID, logMessageType } = event;
    const data = getLockData();

    if (!data[threadID]) return;

    // restore name
    if (logMessageType === "log:thread-name" && data[threadID].name) {
        try {
            await api.setTitle(data[threadID].name, threadID);
            api.sendMessage(`⚠️ Group name is locked to: "${data[threadID].name}"`, threadID);
        } catch (e) {}
    }

    // restore photo
    if (logMessageType === "log:thread-icon" && data[threadID].photo) {
        try {
            const photoStream = fs.createReadStream(data[threadID].photo);
            await api.changeGroupImage(photoStream, threadID);
            api.sendMessage("🖼️ Group photo is locked!", threadID);
        } catch (e) {}
    }
};
