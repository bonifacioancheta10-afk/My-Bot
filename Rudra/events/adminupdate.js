const fs = require("fs");
const path = require("path");

// kunin natin yung lockedSettings mula sa lockgroup command
const { lockedSettings } = require("../commands/lockgroup");

module.exports.config = {
    name: "adminUpdate",
    eventType: [
        "log:thread-admins",
        "log:thread-name",
        "log:user-nickname",
        "log:thread-icon",
        "log:thread-color",
        "log:magic-emoji",
        "log:thread-image" // para sa photo changes
    ],
    version: "1.1.0",
    credits: "Edited by ChatGPT",
    description: "Update team information quickly and lock settings",
    envConfig: {
        sendNoti: true,
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    try {
        let dataThread = (await getData(threadID)).threadInfo || {};
        let authorName = await Users.getNameUser(event.author);

        switch (logMessageType) {
            case "log:thread-name": {
                dataThread.threadName = logMessageData.name || "No name";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed group name to: ${dataThread.threadName}`,
                    threadID
                );
                break;
            }

            case "log:thread-icon": {
                let iconPath = path.join(__dirname, "emoji.json");
                if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
                let preIcon = JSON.parse(fs.readFileSync(iconPath));

                dataThread.threadIcon = logMessageData.thread_icon || "👍";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed group icon\n» Previous icon: ${preIcon[threadID] || "unknown"}`,
                    threadID, () => {
                        preIcon[threadID] = dataThread.threadIcon;
                        fs.writeFileSync(iconPath, JSON.stringify(preIcon));
                    }
                );
                break;
            }

            case "log:thread-color": {
                dataThread.threadColor = logMessageData.thread_color || "🌤";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed group color`,
                    threadID
                );
                break;
            }

            case "log:user-nickname": {
                let targetName = await Users.getNameUser(logMessageData.participant_id);
                if (!dataThread.nicknames) dataThread.nicknames = {};
                dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed nickname of ${targetName} to: ${(logMessageData.nickname.length == 0) ? "original name" : logMessageData.nickname}`,
                    threadID
                );
                break;
            }

            case "log:magic-emoji": { // quick reaction
                let newReaction = logMessageData.reaction || "❓";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed the quick reaction to: ${newReaction}`,
                    threadID
                );
                break;
            }

            case "log:thread-image": {
                if (lockedSettings[threadID] && lockedSettings[threadID].image) {
                    const photoPath = lockedSettings[threadID].image;
                    if (fs.existsSync(photoPath)) {
                        await api.changeGroupImage(fs.createReadStream(photoPath), threadID);
                        api.sendMessage(`🖼️ Group photo is locked. Change reverted.`, threadID);
                    }
                } else {
                    api.sendMessage(
                        `» [ GROUP UPDATE ]\n» ${authorName} changed the group photo.`,
                        threadID
                    );
                }
                break;
            }
        }

        await setData(threadID, { threadInfo: dataThread });
    } catch (e) { console.log(e) };
};
