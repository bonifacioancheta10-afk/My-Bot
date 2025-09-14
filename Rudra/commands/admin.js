module.exports.config = {
    name: "admin",
    version: "1.1.0",
    hasPermssion: 0, 
    credits: "Priyansh Rajput + Modified by ChatGPT",
    description: "Manage bot admins (list, add, remove)",
    commandCategory: "moderation",
    usages: "/admin [list|add|remove] [@mention or userID]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "en": {
        "listAdmin": "👑 [Admin List]\n\n%1",
        "notHavePermssion": "⚠️ You don’t have permission to use \"%1\"",
        "addedNewAdmin": "✅ Added %1 Admin(s):\n\n%2",
        "removedAdmin": "❌ Removed %1 Admin(s):\n\n%2",
        "errorUsage": "⚠️ Wrong usage of /admin command.\n\n👉 Correct usage:\n/admin list\n/admin add @mention\n/admin add <userID>\n/admin remove @mention\n/admin remove <userID>"
    }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { ADMINBOT } = global.config;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const content = args.slice(1);
    const mention = Object.keys(mentions);

    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    switch (args[0]) {
        case "list":
        case "all":
        case "-a": {
            const listAdmin = ADMINBOT || config.ADMINBOT || [];
            let msg = [];

            for (const idAdmin of listAdmin) {
                if (parseInt(idAdmin)) {
                    const name = await Users.getNameUser(idAdmin);
                    msg.push(`- ${name} (https://facebook.com/${idAdmin})`);
                }
            }
            return api.sendMessage(getText("listAdmin", msg.join("\n")), threadID, messageID);
        }

        case "add": {
            if (permssion != 2) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);

            if (mention.length > 0) {
                let listAdd = [];
                for (const id of mention) {
                    ADMINBOT.push(id);
                    config.ADMINBOT.push(id);
                    listAdd.push(`[ ${id} ] » ${event.mentions[id]}`);
                }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length > 0 && !isNaN(content[0])) {
                ADMINBOT.push(content[0]);
                config.ADMINBOT.push(content[0]);
                const name = await Users.getNameUser(content[0]);
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", 1, `[ ${content[0]} ] » ${name}`), threadID, messageID);
            }
            else return api.sendMessage(getText("errorUsage"), threadID, messageID);
        }

        case "remove":
        case "rm":
        case "delete": {
            if (permssion != 2) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);

            if (mention.length > 0) {
                let listRemove = [];
                for (const id of mention) {
                    const index = config.ADMINBOT.findIndex(item => item == id);
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    listRemove.push(`[ ${id} ] » ${event.mentions[id]}`);
                }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listRemove.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length > 0 && !isNaN(content[0])) {
                const index = config.ADMINBOT.findIndex(item => item.toString() == content[0]);
                ADMINBOT.splice(index, 1);
                config.ADMINBOT.splice(index, 1);
                const name = await Users.getNameUser(content[0]);
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", 1, `[ ${content[0]} ] » ${name}`), threadID, messageID);
            }
            else return api.sendMessage(getText("errorUsage"), threadID, messageID);
        }

        default: {
            return api.sendMessage(getText("errorUsage"), threadID, messageID);
        }
    }
}
