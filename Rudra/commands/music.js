const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "music",
  version: "1.1.0",
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

  try {
    // 🔍 Step 1: Search
    const searchUrl = `https://daikyu-api.up.railway.app/api/ytsearch?query=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const data = searchRes.data;

    if (!data.results || data.results.length === 0) {
      return api.sendMessage("⚠️ No results found.", threadID, messageID);
    }

    const firstResult = data.results[0];

    // 🎶 Step 2: Download MP3
    const downloadUrl = `https://daikyu-api.up.railway.app/api/ytmp3?Url=${encodeURIComponent(firstResult.url)}`;
    const dlRes = await axios.get(downloadUrl);

    if (!dlRes.data || !dlRes.data.download) {
      return api.sendMessage("⚠️ Failed to download the song.", threadID, messageID);
    }

    const mp3Url = dlRes.data.download;
    const filePath = path.join(__dirname, "music.mp3");

    // Download and save locally
    const response = await axios.get(mp3Url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // 📤 Send file to GC
    api.sendMessage(
      {
        body: `🎵 Now Playing: ${firstResult.title}\n⏱ Duration: ${firstResult.duration}`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => {
        fs.unlinkSync(filePath); // delete temp file after sending
      }
    );

  } catch (err) {
    console.error("❌ Music Command Error:", err);
    return api.sendMessage("⚠️ Cannot connect to music API right now.", threadID, messageID);
  }
};
