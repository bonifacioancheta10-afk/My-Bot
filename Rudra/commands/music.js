const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "music",
  version: "1.3.2",
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

  // Process message muna
  api.sendMessage(`⏳ Searching and downloading "${query}", please wait...`, threadID, messageID);

  try {
    // 🔍 Step 1: Search YouTube
    const searchUrl = `https://daikyu-api.up.railway.app/api/ytsearch?query=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const data = searchRes.data;

    if (!data.results || data.results.length === 0) {
      return api.sendMessage("⚠️ No results found.", threadID, messageID);
    }

    const firstResult = data.results[0];

    // 🎶 Step 2: Download MP3 link
    const downloadUrl = `https://daikyu-api.up.railway.app/api/ytmp3?Url=${encodeURIComponent(firstResult.url)}`;
    const dlRes = await axios.get(downloadUrl);

    const info = dlRes.data.data || dlRes.data;
    const mp3Url = info.download;

    if (!mp3Url) {
      return api.sendMessage("⚠️ Music API did not return a download link.", threadID, messageID);
    }

    // Filename base sa title
    const safeTitle = (info.title || firstResult.title || "music").replace(/[\\/:*?"<>|]/g, "");
    const filePath = path.join(__dirname, `${safeTitle}.mp3`);

    // ⬇️ Step 3: Download file
    const response = await axios.get(mp3Url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // 📤 Step 4: Send to GC
    api.sendMessage(
      {
        body: `🎵 Now Playing: ${info.title || firstResult.title}\n⏱ Duration: ${firstResult.duration || "Unknown"}\n📥 Downloaded successfully!`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => {
        fs.unlinkSync(filePath); // delete temp file
      }
    );

  } catch (err) {
    console.error("❌ Music Command Error:", err);
    return api.sendMessage("⚠️ Cannot connect to music API right now.", threadID, messageID);
  }
};
