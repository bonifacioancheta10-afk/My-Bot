const axios = require("axios");

module.exports.config = {
  name: "bot",
  version: "3.0.1",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Chat with GPT-5 (stable, no history)",
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

// 🔹 GPT-5 API handler (no history)
async function gptReply(api, event, userMessage) {
  api.setMessageReaction("🤖", event.messageID, () => {}, true);

  let reply = null;
  try {
    const res = await axios.get("https://daikyu-api.up.railway.app/api/openai-gpt-5", {
      params: {
        ask: userMessage,
        uid: event.senderID
      },
      timeout: 10000
    });

    reply = res.data?.response;
  } catch (e) {
    console.error("❌ GPT-5 API Error:", e.message);
  }

  // 🔹 Single error message
  if (!reply || reply.length < 2) {
    reply = "❌ I can’t connect to GPT right now.";
  }

  api.setMessageReaction("✅", event.messageID, () => {}, true);
  return api.sendMessage(reply, event.threadID, event.messageID);
}
