module.exports.config = {
  name: "wfl",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Auto detect WFL text and reply with random result + react",
  commandCategory: "fun",
  usages: "Just type wfl, pwfl, pawfl, w/f/l, or w|f|l",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // Regex detect (case insensitive)
  const regex = /\b(?:wfl|pwfl|pawfl|w\/f\/l|w\|f\|l)\b/i;
  if (regex.test(body)) {
    // Random pick
    const choices = ["win", "fair", "lose"];
    const pick = choices[Math.floor(Math.random() * choices.length)];

    if (pick === "win") {
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage("✅ Win", threadID, messageID);
    }
    if (pick === "lose") {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Lose", threadID, messageID);
    }
    if (pick === "fair") {
      api.setMessageReaction("⚖️", messageID, () => {}, true);
      return api.sendMessage("⚖️ Fair", threadID, messageID);
    }
  }
};

module.exports.run = async function () {
  // Auto detect only, no manual trigger
  return;
};
