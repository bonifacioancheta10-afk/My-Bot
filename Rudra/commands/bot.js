const axios = require("axios");

module.exports.config = {
  name: "bot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Talk to bot",
  commandCategory: "AI",
  usages: "Just mention bot"
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const body = (event.body || "").trim();
    if (!body) return;

    const sender = event.senderID;
    const threadID = event.threadID;

    // ignore commands (/ or !)
    if (/^\s*\/|^\s*!/.test(body)) return;

    // ignore self
    const botID = api.getCurrentUserID && api.getCurrentUserID();
    if (String(sender) === String(botID)) return;

    // trigger word = bot
    if (!/\bbot\b/i.test(body)) return;

    // remove the word "bot" para malinis ang ipapadala sa API
    let cleaned = body.replace(/\bbot\b/gi, "").trim();
    if (!cleaned) cleaned = "hello";

    // call API
    const API_URL = "https://daikyu-api.up.railway.app/api/sim-simi";
    let reply;
    try {
      const res = await axios.get(API_URL, {
        params: { talk: cleaned },
        timeout: 20_000
      });
      reply = res.data?.response || null;
    } catch (err) {
      console.error("Bot API error:", err?.message || err);
    }

    // fallback
    if (!reply) {
      reply = "🤖 Hindi ako makareply ngayon, try ulit mamaya.";
    }

    // ✅ reply directly to user's message
    return api.sendMessage(
      { body: reply },
      threadID,
      event.messageID
    );
  } catch (e) {
    console.error("bot fatal:", e);
  }
};
