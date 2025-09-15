const axios = require("axios");

module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Fetch TikTok profile information",
  commandCategory: "Utilities",
  usages: "/tiktok <username>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const username = args[0];

  if (!username) {
    return api.sendMessage(
      "❌ Usage: /tiktok <username>",
      threadID,
      messageID
    );
  }

  try {
    const res = await axios.get(
      `https://betadash-api-swordslush-production.up.railway.app/tikstalk?username=${encodeURIComponent(username)}`
    );
    const data = res.data;

    if (!data.username) {
      return api.sendMessage("⚠️ User not found or API error.", threadID, messageID);
    }

    let msg = `📱 TikTok Stalker Result\n\n`;
    msg += `👤 Name: ${data.username}\n`;
    msg += `🏷️ Nickname: ${data.nickname || "N/A"}\n`;
    msg += `🆔 ID: ${data.id}\n`;
    msg += `📝 Bio: ${data.signature || "No bio"}\n`;
    msg += `🎥 Videos: ${data.videoCount}\n`;
    msg += `👥 Following: ${data.followingCount}\n`;
    msg += `👨‍👩‍👧 Followers: ${data.followerCount}\n`;
    msg += `❤️ Hearts: ${data.heartCount}\n`;
    msg += `👍 Diggs: ${data.diggCount}\n`;
    msg += `🔗 SecUID: ${data.secUid}\n`;

    return api.sendMessage(
      {
        body: msg,
        attachment: await global.utils.getStreamFromURL(data.avatarLarger)
      },
      threadID,
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch TikTok data.", threadID, messageID);
  }
};
