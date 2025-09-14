const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "music",
  version: "1.3.3",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Search and play music from YouTube",
  commandCategory: "media",
  usages: "/music <song name>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  if (!args[0]) {
    return api.sendMessage("❌ Please provide a song name.\nUsage: /music <song name>", threadID, messageID);
  }

  const query = args.join(" ");
  api.sendMessage(`⏳ Searching and downloading "${query}", please wait...`, threadID, messageID);

  try {
    // 🔍 Step 1: Search
    const searchRes = await axios.get(`https://daikyu-api.up.railway.app/api/ytsearch?query=${encodeURIComponent(query)}`);
    if (!searchRes.data.results?.length) {
      return api.sendMessage("⚠️ No results found.", threadID, messageID);
    }
    const firstResult = searchRes.data.results[0];

    // 🎶 Step 2: Get MP3 link
    const dlRes = await axios.get(`https://daikyu-api.up.railway.app/api/ytmp3?Url=${encodeURIComponent(firstResult.url)}`);
    const info = dlRes.data;
    const mp3Url = info.download;

    if (!mp3Url) {
      return api.sendMessage("⚠️ Music API did not return a download link.", threadID, messageID);
    }

    // 📂 File path
    const safeTitle = (info.title || firstResult.title || "music").replace(/[\\/:*?"<>|]/g, "");
    const filePath = path.join(__dirname, `${safeTitle}.mp3`);

    // ⬇️ Download MP3
    const response = await axios.get(mp3Url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // 📤 Send file
    api.sendMessage(
      {
        body: `🎵 Now Playing: ${info.title || firstResult.title}\n⏱ Duration: ${firstResult.duration || "Unknown"}`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath)
    );

  } catch (err) {
    console.error("❌ Music Command Error:", err);
    return api.sendMessage("⚠️ Cannot connect to music API right now.", threadID, messageID);
  }
};
