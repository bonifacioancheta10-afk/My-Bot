module.exports.config = {
  name: "scammer",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Scammer list manager",
  commandCategory: "Utilities",
  usages: "/scammer add <name> <fb link> | /scammer remove <number> | /scammer",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, Models, Users }) {
  const { threadID, senderID } = event;
  const Scammer = Models.use("Scammer");

  const sub = args[0]?.toLowerCase();

  // ➕ Add scammer
  if (sub === "add") {
    if (args.length < 3) {
      return api.sendMessage("❌ Usage: /scammer add <name> <fb link>", threadID);
    }

    const link = args[args.length - 1];
    const name = args.slice(1, -1).join(" ");

    await Scammer.create({
      name,
      link,
      addedBy: senderID,
    });

    return api.sendMessage(`✅ Added scammer:\n👤 ${name}\n🔗 ${link}`, threadID);
  }

  // ➖ Remove scammer
  if (sub === "remove") {
    if (args.length < 2 || isNaN(args[1])) {
      return api.sendMessage("❌ Usage: /scammer remove <number>", threadID);
    }

    const index = parseInt(args[1]) - 1;
    const scammers = await Scammer.findAll();

    if (!scammers[index]) {
      return api.sendMessage("⚠️ Invalid scammer number.", threadID);
    }

    const removed = scammers[index];
    await removed.destroy();

    return api.sendMessage(`🗑️ Removed scammer:\n👤 ${removed.name}\n🔗 ${removed.link}`, threadID);
  }

  // 📜 Show list
  const scammers = await Scammer.findAll();
  if (scammers.length === 0) {
    return api.sendMessage("📭 No scammers added yet.", threadID);
  }

  let msg = "⚠️ SCAMMER LIST ⚠️\n\n";
  scammers.forEach((s, i) => {
    msg += `${i + 1}. 👤 ${s.name}\n🔗 ${s.link}\n━━━━━━━━━━━━━━\n`;
  });

  return api.sendMessage(msg, threadID);
};
