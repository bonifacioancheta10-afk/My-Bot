module.exports.config = {
  name: "help",
  version: "3.4.3",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Show all available commands and usage",
  commandCategory: "system",
  usages: "/help [command]",
  cooldowns: 1
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const commands = global.client.commands;

  // 📌 Case: /help <command>
  if (args[0]) {
    const cmdName = args[0].toLowerCase();
    const command = commands.get(cmdName) || commands.get(global.client.aliases?.get(cmdName));

    if (!command) {
      return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID);
    }

    const config = command.config;
    let details = `HELP → /${config.name}\n\n`;
    details += `Description: ${config.description || "No description"}\n`;
    if (config.usages) details += `Usage: ${config.usages}\n`;
    details += `Permission: ${config.hasPermssion || 0}\n`;
    details += `Cooldown: ${config.cooldowns || 0}s`;

    return api.sendMessage(details, threadID);
  }

  // 📌 Case: /help (list all with styled numbering)
  let helpMenu = "AVAILABLE COMMANDS\n━━━━━━━━━━━━━━━\n\n";

  let i = 1;
  commands.forEach(cmd => {
    const cfg = cmd.config;
    helpMenu += `【${i}】 ✦ /${cfg.name}\n`;
    if (cfg.usages) helpMenu += `    Usage: ${cfg.usages}\n`;
    helpMenu += "\n";
    i++;
  });

  helpMenu += "━━━━━━━━━━━━━━━\nUse /help <command> to see detailed usage.\n\n";
  helpMenu += "👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥\n";
  helpMenu += "   𝗝𝗮𝘆𝗹𝗼𝗿𝗱 𝗟𝗮 𝗣𝗲ñ𝗮\n";
  helpMenu += "   🌐 https://www.facebook.com/jaylordlapena2298";

  return api.sendMessage(helpMenu, threadID);
};
