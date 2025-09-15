module.exports.config = {
  name: "callad",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 | Edited by Jaylord",
  description: "Report bug of your bot to admin or comment",
  commandCategory: "Moderation",
  usages: "/callad [message]",
  cooldowns: 5,
};

module.exports.handleReply = async function({ api, args, event, handleReply, Users }) {
  try {
    var name = (await Users.getData(event.senderID)).name;
    var s = [];
    var l = [];
    const fs = require('fs-extra');
    const { join } = require('path');
    const axios = require('axios');
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length || 20;

    if (event.attachments.length != 0) {
      for (var p of event.attachments) {
        var result = '';
        for (var i = 0; i < charactersLength; i++) 
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        let e = "jpg";
        if (p.type == 'video') e = "mp4";
        if (p.type == 'audio') e = "mp3";
        if (p.type == 'animated_image') e = "gif";
        var o = join(__dirname, 'cache', `${result}.${e}`);
        let m = (await axios.get(encodeURI(p.url), { responseType: "arraybuffer" })).data;
        fs.writeFileSync(o, Buffer.from(m, "utf-8"));
        s.push(o);
        l.push(fs.createReadStream(o));
      }
    };

    switch (handleReply.type) {
      case "reply": {
        var idad = global.config.ADMINBOT;
        if (s.length == 0) {
          for (let ad of idad) {
            api.sendMessage({
              body: "[📲] Feedback from " + name + " :\n[💬] " + (event.body || "No content"), 
              mentions: [{ id: event.senderID, tag: name }]
            }, ad, (e, data) => global.client.handleReply.push({
              name: this.config.name,
              messageID: data.messageID,
              messID: event.messageID,
              author: event.senderID,
              id: event.threadID,
              type: "calladmin"
            }));
          }
        } else {
          for (let ad of idad) {
            api.sendMessage({
              body: "[📲] Feedback from " + name + ":\n" + (event.body || "Files only, no text 🧡"), 
              attachment: l, 
              mentions: [{ id: event.senderID, tag: name }]
            }, ad, (e, data) => global.client.handleReply.push({
              name: this.config.name,
              messageID: data.messageID,
              messID: event.messageID,
              author: event.senderID,
              id: event.threadID,
              type: "calladmin"
            }));
            for (var b of s) fs.unlinkSync(b);
          }
        }
        break;
      }
      case "calladmin": {
        if (s.length == 0) {
          api.sendMessage({ 
            body: `[📌] Feedback from admin ${name} to you:\n\n[💬] ${event.body || "No reply 🌸"}\n\n» Reply to this message if you want to continue reporting`, 
            mentions: [{ tag: name, id: event.senderID }] 
          }, handleReply.id, (e, data) => global.client.handleReply.push({
            name: this.config.name,
            author: event.senderID,
            messageID: data.messageID,
            type: "reply"
          }), handleReply.messID);
        } else {
          api.sendMessage({ 
            body: `[📌] Feedback from admin ${name} to you:\n\n[💬] ${event.body || "Files only 🌸"}\n[💌] Admin sent files\n\n» Reply to continue reporting`, 
            attachment: l, 
            mentions: [{ tag: name, id: event.senderID }] 
          }, handleReply.id, (e, data) => global.client.handleReply.push({
            name: this.config.name,
            author: event.senderID,
            messageID: data.messageID,
            type: "reply"
          }), handleReply.messID);
          for (var b of s) fs.unlinkSync(b);
        }
        break;
      }
    }
  } catch (ex) {
    console.log(ex);
  }
};

module.exports.run = async function({ api, event, Threads, args, Users }) {
  try {
    const fs = require('fs-extra');
    const { join } = require('path');
    const axios = require('axios');
    var s = [];
    var l = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length || 20;

    if (event.messageReply && event.messageReply.attachments.length != 0) {
      for (var p of event.messageReply.attachments) {
        var result = '';
        for (var i = 0; i < charactersLength; i++) 
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        let e = "jpg";
        if (p.type == 'video') e = "mp4";
        if (p.type == 'audio') e = "mp3";
        if (p.type == 'animated_image') e = "gif";
        var o = join(__dirname, 'cache', `${result}.${e}`);
        let m = (await axios.get(encodeURI(p.url), { responseType: "arraybuffer" })).data;
        fs.writeFileSync(o, Buffer.from(m, "utf-8"));
        s.push(o);
        l.push(fs.createReadStream(o));
      }
    }

    if (!args[0] && (!event.messageReply || event.messageReply.attachments.length == 0)) {
      return api.sendMessage(
        `❌ Wrong usage!\n\n📌 Correct Example:\n/callad The bot has a bug when bidding.\n\nUsage: ${this.config.usages}`,
        event.threadID,
        event.messageID
      );
    }

    var name = (await Users.getData(event.senderID)).name;
    var idbox = event.threadID;
    var datathread = (await Threads.getData(event.threadID)).threadInfo;
    var namethread = datathread.threadName;
    var uid = event.senderID;

    const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Manila").format("HH:mm:ss D/MM/YYYY");
    var soad = global.config.ADMINBOT.length;

    api.sendMessage(`[🤖] Your report has been sent to ${soad} admin(s).\n[⏰] Time: ${gio}`,
      event.threadID,
      () => {
        var idad = global.config.ADMINBOT;
        if (s.length == 0) {
          for (let ad of idad) {
            api.sendMessage({ 
              body: `📱 [CALL ADMIN] 📱\n\n[👤] From: ${name}\n[🆔] User ID: ${uid}\n[💬] Box: ${namethread}\n[🔰] Box ID: ${idbox}\n\n[💌] Report: ${args.join(" ")}\n[⏰] ${gio}`, 
              mentions: [{ id: event.senderID, tag: name }] 
            }, ad, (error, info) =>
              global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                messID: event.messageID,
                id: idbox,
                type: "calladmin"
              })
            );
          }
        } else {
          for (let ad of idad) {
            api.sendMessage({ 
              body: `📱 [CALL ADMIN] 📱\n\n[👤] From: ${name}\n[🆔] User ID: ${uid}\n[💬] Box: ${namethread}\n[🔰] Box ID: ${idbox}\n\n[💌] Report: ${(args.join(" ")) || "Files only"}\n[⏰] ${gio}\n[📌] With attachment(s).`, 
              attachment: l, 
              mentions: [{ id: event.senderID, tag: name }] 
            }, ad, (error, info) =>
              global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                messID: event.messageID,
                id: idbox,
                type: "calladmin"
              })
            );
          }
          for (var b of s) fs.unlinkSync(b);
        }
      }, 
      event.messageID
    );
  } catch (ex) {
    console.log(ex);
  }
};
