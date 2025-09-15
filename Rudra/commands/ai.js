const axios = require("axios");

module.exports.config = {
  name: "ai",
  version: "3.0.5",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Chat with GPT-4o (stable, no history)",
  commandCategory: "ai",
  usePrefix: true,
  usages: "/ai <message>",
  cooldowns: 5// 🔹 Dito mo idinadagdag alias
};

// 🔹 Command with prefix only (/bot or /ai)
module.exports.run = async function ({ api, event, args }) {
  let userMessage = args.join(" ").trim();
  if (!userMessage) {
    return api.sendMessage("❌ Please type a message.", event.threadID, event.messageID);
  }
  return gptReply(api, event, userMessage);
};

// 🔹 GPT-4o API handler (20s timeout, no reaction)
async function gptReply(api, event, userMessage) {
  let reply = null;
  try {
    const res = await axios.get("https://daikyu-api.up.railway.app/api/gpt-4o-2024", {
      params: {
        ask: userMessage,
        uid: event.senderID
      },
      timeout: 20000 // 20 seconds timeout
    });

    reply = res.data?.response;
  } catch (e) {
    console.error("❌ GPT-4o API Error:", e.message);
  }

  if (!reply || reply.length < 2) {
    reply = "❌ I can’t connect to GPT right now.";
  }

  return api.sendMessage(reply, event.threadID, event.messageID);
}
