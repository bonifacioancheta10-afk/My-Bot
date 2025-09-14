const axios = require("axios");

module.exports.config = {
  name: "bot",
  version: "3.0.3",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Chat with GPT-4o (stable, no history)",
  commandCategory: "ai",
  usePrefix: true,
  usages: "bot <message>",
  cooldowns: 5,
};

// 🔹 Command with prefix
module.exports.run = async function ({ api, event, args }) {
  let userMessage = args.join(" ").trim();
  if (!userMessage) {
    return api.sendMessage("❌ Please type a message.", event.threadID, event.messageID);
  }
  return gptReply(api, event, userMessage);
};

// 🔹 Auto-detect kapag may "bot", "gpt", "jandel", o "ai" (word boundary only)
module.exports.handleEvent = async function ({ api, event }) {
  const rawMessage = event.body?.trim();
  if (!rawMessage) return;

  // Regex: detect bot, gpt, jandel, ai (whole word only)
  if (/\b(bot|gpt|jandel|ai)\b/i.test(rawMessage)) {
    let cleaned = rawMessage.replace(/\b(bot|gpt|jandel|ai)\b/gi, "").trim();
    if (!cleaned) cleaned = "hello there";
    return gptReply(api, event, cleaned);
  }
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

  // 🔹 Single error message
  if (!reply || reply.length < 2) {
    reply = "❌ I can’t connect to GPT right now.";
  }

  return api.sendMessage(reply, event.threadID, event.messageID);
}
