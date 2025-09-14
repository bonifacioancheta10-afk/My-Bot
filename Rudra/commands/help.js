module.exports.config = {
  name: "help",
  version: "3.3.2",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Show all available commands and usage",
  commandCategory: "system",
  usages: "/help [command]",
  cooldowns: 1
};

// 🔹 Convert only letters/numbers to Unicode Bold
function toUnicodeBold(str) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bold = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" +
               "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" +
               "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟟𝟴𝟵";
  return str.split("").map(ch => {
    const i = normal.indexOf(ch);
    return i >= 0 ? bold[i] : ch;
  }).join("");
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const commands = global.client.commands;

  // 📌 /help <command>
  if (args[0]) {
    const cmdName = args[0].toLowerCase();
    const command = commands.get(cmdName) || commands.get(global.client.aliases?.get(cmdName));

    if (!command) {
      return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID);
    }

    const config = command.config;
    const details = 
`📖 𝗛𝗘𝗟𝗣 → /${toUnicodeBold(config.name)}

📝 Description: ${config.description || "No description"}
⚙️ Usage: ${config.usages || "No usage info"}
👤 Permission: ${config.hasPermssion || 0}
⏱ Cooldown: ${config.cooldowns || 0}s`;

    return api.sendMessage(details, threadID);
  }

  // 📌 /help (list all)
  let helpMenu = "📖 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦\n━━━━━━━━━━━━━━━\n\n";

  commands.forEach(cmd => {
    const cfg = cmd.config;
    helpMenu += `✨ /${toUnicodeBold(cfg.name)}\n`;
    if (cfg.usages) helpMenu += `   ➝ ${cfg.usages}\n`;
    helpMenu += "\n";
  });

  helpMenu += "━━━━━━━━━━━━━━━\n💡 Use /help <command> to see detailed usage.";

  return api.sendMessage(helpMenu, threadID);
};
