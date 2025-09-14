const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "adminUpdate",
    eventType: [
        "log:thread-admins",
        "log:thread-name",
        "log:user-nickname",
        "log:thread-icon",
        "log:thread-color",
        "log:magic-emoji"
    ],
    version: "1.0.3",
    credits: "Edited by ChatGPT",
    description: "Update team information quickly",
    envConfig: {
        sendNoti: true
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    // JSON file for tracking old icons
    const iconPath = path.join(__dirname, "emoji.json");
    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));

    // Load existing thread data (with fallback)
    let threadData = await getData(threadID);
    let dataThread = threadData.threadInfo || {
        threadName: "",
        threadIcon: "",
        threadColor: "",
        nicknames: {}
    };

    let authorName = await Users.getNameUser(event.author).catch(() => "Someone");

    try {
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
                let preIcon = JSON.parse(fs.readFileSync(iconPath, "utf8"));
                dataThread.threadIcon = logMessageData.thread_icon || "👍";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed group icon\n» Previous icon: ${preIcon[threadID] || "unknown"}\n» New icon: ${dataThread.threadIcon}`,
                    threadID,
                    () => {
                        preIcon[threadID] = dataThread.threadIcon;
                        fs.writeFileSync(iconPath, JSON.stringify(preIcon, null, 2));
                    }
                );
                break;
            }

            case "log:thread-color": {
                dataThread.threadColor = logMessageData.thread_color || "🌈";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed group color.`,
                    threadID
                );
                break;
            }

            case "log:user-nickname": {
                let targetName = await Users.getNameUser(logMessageData.participant_id)
                    .catch(() => "Member");
                dataThread.nicknames = dataThread.nicknames || {};
                dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname || "";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed nickname of ${targetName} to: ${(logMessageData.nickname?.length == 0) ? "original name" : logMessageData.nickname}`,
                    threadID
                );
                break;
            }

            case "log:magic-emoji": {
                let newReaction = logMessageData.reaction || "❓";
                api.sendMessage(
                    `» [ GROUP UPDATE ]\n» ${authorName} changed the quick reaction to: ${newReaction}`,
                    threadID
                );
                break;
            }
        }

        await setData(threadID, { threadInfo: dataThread });
    } catch (e) {
        console.error("⚠️ Error in adminUpdate.js:", e);
    }
};
