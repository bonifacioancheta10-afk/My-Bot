module.exports.config = {
  name: "help",
  version: "3.3.3",
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

  // 📌 /help <command>
  if (args[0]) {
    const cmdName = args[0].toLowerCase();
    const command = commands.get(cmdName) || commands.get(global.client.aliases?.get(cmdName));

    if (!command) {
      return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID);
    }

    const config = command.config;
    const details = 
`📖 HELP → /${config.name}

📝 Description: ${config.description || "No description"}
⚙️ Usage: ${config.usages || "No usage info"}
👤 Permission: ${config.hasPermssion || 0}
⏱ Cooldown: ${config.cooldowns || 0}s`;

    return api.sendMessage(details, threadID);
  }

  // 📌 /help (list all)
  let helpMenu = "📖 AVAILABLE COMMANDS\n━━━━━━━━━━━━━━━\n\n";

  commands.forEach(cmd => {
    const cfg = cmd.config;
    helpMenu += `✨ /${cfg.name}\n`;
    if (cfg.usages) helpMenu += `   ➝ ${cfg.usages}\n`;
    helpMenu += "\n";
  });

  helpMenu += "━━━━━━━━━━━━━━━\n💡 Use /help <command> to see detailed usage.";

  return api.sendMessage(helpMenu, threadID);
};
