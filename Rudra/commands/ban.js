const { sequelize } = require("../../database");
const initModels = require("../../database/models"); // ✅ folder "models"
const { Ban } = initModels({ sequelize }); // ✅ wala nang .model

module.exports.config = {
  name: "ban",
  version: "3.0.1",
  hasPermssion: 1,
  credits: "Modified by ChatGPT",
  description: "Ban system with DB (kick + save reason)",
  commandCategory: "moderation",
  usages: "/ban @mention reason | /ban list | /ban reset | /ban unban @mention",
  cooldowns: 5
};

async function sendUsage(api, threadID, messageID) {
  return api.sendMessage(
    "❌ Mali ang paggamit!\n" +
    "✅ Mga tamang gamit:\n" +
    "/ban @mention reason\n" +
    "/ban list\n" +
    "/ban reset\n" +
    "/ban unban @mention",
    threadID,
    messageID
  );
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, mentions } = event;

  if (!args[0]) return sendUsage(api, threadID, messageID);
  const subCommand = args[0].toLowerCase();

  // 📌 /ban list
  if (subCommand === "list") {
    const bans = await Ban.findAll({ where: { threadID } });
    if (!bans.length) return api.sendMessage("✅ Walang naka-ban sa thread na ito.", threadID, messageID);

    let msg = "📋 Listahan ng mga naka-ban:\n";
    for (const b of bans) {
      msg += `- UID: ${b.userID} | Reason: ${b.reason || "No reason"}\n`;
    }
    return api.sendMessage(msg, threadID, messageID);
  }

  // 📌 /ban reset
  if (subCommand === "reset") {
    await Ban.destroy({ where: { threadID } });
    return api.sendMessage("♻️ Na-reset na lahat ng ban sa thread na ito.", threadID, messageID);
  }

  // 📌 /ban unban @mention
  if (subCommand === "unban") {
    if (Object.keys(mentions).length === 0) return sendUsage(api, threadID, messageID);
    const userID = Object.keys(mentions)[0];

    const unban = await Ban.destroy({ where: { threadID, userID } });
    if (!unban) return api.sendMessage("⚠️ Walang ban record para sa user na ito.", threadID, messageID);

    return api.sendMessage(`✅ Natanggal na ang ban kay ${mentions[userID]}`, threadID, messageID);
  }

  // 📌 /ban @mention reason
  if (Object.keys(mentions).length === 0) return sendUsage(api, threadID, messageID);

  const userID = Object.keys(mentions)[0];
  const reason = args.slice(1).join(" ") || "No reason";

  await Ban.create({
    userID,
    threadID,
    reason
  });

  api.removeUserFromGroup(userID, threadID, (err) => {
    if (err) return api.sendMessage("⚠️ Hindi na-kick ang user (baka admin siya o may error).", threadID, messageID);
    return api.sendMessage(`✅ User ${mentions[userID]} ay na-ban!\nReason: ${reason}`, threadID, messageID);
  });
};

// 📌 Auto re-kick kapag nag rejoin
module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType === "log:subscribe") {
    const { threadID, logMessageData } = event;

    if (!logMessageData.addedParticipants) return;

    for (const participant of logMessageData.addedParticipants) {
      const userID = participant.userFbId;

      const ban = await Ban.findOne({ where: { threadID, userID } });
      if (ban) {
        api.removeUserFromGroup(userID, threadID, () => {
          api.sendMessage(
            `⛔ User ${participant.fullName || userID} ay naka-ban!\nReason: ${ban.reason}`,
            threadID
          );
        });
      }
    }
  }
};
