module.exports.config = {
    name: "antirobbery",
    version: "1.1.0",
    credits: "Priyansh Rajput + Modified by ChatGPT",
    hasPermssion: 1,
    description: "Toggle Anti-Robbery (Prevent changing group admins)",
    usages: "/antirobbery",
    commandCategory: "Moderation",
    cooldowns: 3
};

module.exports.languages = {
    "en": {
        "needAdmin": "⚠️ I need group admin permissions. Please add me as admin and try again.",
        "turnedOn": "✅ Anti-Robbery has been **enabled**. Group admin changes are now protected.",
        "turnedOff": "❌ Anti-Robbery has been **disabled**. Group admin changes are no longer protected.",
        "errorUsage": "⚠️ Wrong usage of /antirobbery.\n\n👉 Correct usage:\n/antirobbery"
    }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
    const { threadID, messageID } = event;

    // Check if bot is admin
    const info = await api.getThreadInfo(threadID);
    if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
        return api.sendMessage(getText("needAdmin"), threadID, messageID);
    }

    // Get thread data
    const data = (await Threads.getData(threadID)).data || {};

    // Toggle guard
    if (typeof data["guard"] !== "boolean" || data["guard"] === false) {
        data["guard"] = true;
        await Threads.setData(threadID, { data });
        global.data.threadData.set(parseInt(threadID), data);
        return api.sendMessage(getText("turnedOn"), threadID, messageID);
    } else {
        data["guard"] = false;
        await Threads.setData(threadID, { data });
        global.data.threadData.set(parseInt(threadID), data);
        return api.sendMessage(getText("turnedOff"), threadID, messageID);
    }
};
