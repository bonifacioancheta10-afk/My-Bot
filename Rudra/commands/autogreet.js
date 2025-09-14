module.exports.config = {
  name: "autobible",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Automatically sends Bible verses at specific times",
  commandCategory: "system",
  usages: "/autobible",
  cooldowns: 0
};

const axios = require("axios");
let autoBibleInterval = null;
let lastSentKey = null;

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function getPhilTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const offset = 8 * 60 * 60000; // UTC+8 Philippines
  return new Date(utc + offset);
}

// Mga oras + dagdag na mensahe
const verseSchedule = {
  "4:0": "🌅 Good morning! Start your day with God’s word.",
  "8:0": "☀️ Start your day with faith and strength!",
  "12:0": "🍽 Lunch time blessings! May God fill you with peace.",
  "15:0": "⛅ Keep going, God is with you.",
  "19:0": "🌇 Good evening! Stay blessed in His grace.",
  "22:0": "🌙 Good night, rest in His peace."
};

// 🔹 Manual command
module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
    "📖 AutoBible is automatic. Verses will be posted at:\n\n⏰ 4:00 AM - Good Morning\n⏰ 8:00 AM\n⏰ 12:00 PM\n⏰ 3:00 PM\n⏰ 7:00 PM\n⏰ 10:00 PM\n\n(Timezone: Philippines UTC+8)",
    event.threadID,
    event.messageID
  );
};

// 🔹 Autostart
module.exports.onLoad = function ({ api }) {
  console.log("✅ AutoBible loaded.");

  if (autoBibleInterval) return;

  autoBibleInterval = setInterval(async () => {
    try {
      const now = getPhilTime();
      const hour = now.getHours();
      const minute = now.getMinutes();

      const key = `${hour}:${minute}`;
      if (!verseSchedule[key]) return;

      if (lastSentKey === key) return; // Huwag ulit-ulitin
      lastSentKey = key;

      // Fetch verse galing API
      let verseText = "";
      try {
        const res = await axios.get("https://labs.bible.org/api/?passage=random&type=json");
        if (res.data && res.data[0]) {
          verseText = `${res.data[0].bookname} ${res.data[0].chapter}:${res.data[0].verse} - ${res.data[0].text}`;
        } else {
          verseText = "📖 Bible verse could not be fetched.";
        }
      } catch (e) {
        verseText = "⚠️ Failed to fetch verse.";
      }

      const finalMsg = `📖 ${verseText}\n\n${verseSchedule[key]}`;

      // Send sa lahat ng groups
      let threads = [];
      try {
        threads = await api.getThreadList(50, null, ["INBOX"]);
      } catch (err) {
        return console.error("⚠️ Could not fetch thread list:", err.message);
      }

      const groups = threads.filter(t => t.isGroup);
      for (const g of groups) {
        api.sendMessage(finalMsg, g.threadID, (err) => {
          if (err) console.error(`❌ Failed to send verse to ${g.threadID}:`, err.message);
        });
        await sleep(500);
      }

      console.log(`✅ Sent AutoBible at ${key}`);
    } catch (err) {
      console.error("❌ AutoBible error:", err.message);
    }
  }, 30 * 1000); // Check every 30s
};

module.exports.onUnload = function () {
  if (autoBibleInterval) {
    clearInterval(autoBibleInterval);
    autoBibleInterval = null;
  }
  console.log("🛑 AutoBible stopped.");
};
