// === modules/commands/shop.js ===

module.exports.config = {
  name: "shop",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Auto Shop system (per GC, every 20 minutes)",
  commandCategory: "Economy",
  usages: "/shop add <details> | /shop remove | /shop list",
  cooldowns: 5,
};

let nextPostTime = null;
let started = false;

module.exports.run = async function ({ api, event, args, Users, models }) {
  const { threadID, senderID } = event;
  const { Shop, Bank } = models;

  const sub = args[0]?.toLowerCase();

  // ❌ Wrong usage → show guide
  if (!["add", "remove", "list"].includes(sub)) {
    return api.sendMessage(
      "❌ Usage:\n" +
      "• /shop add <details>\n" +
      "• /shop remove\n" +
      "• /shop list",
      threadID
    );
  }

  // 🗑 Remove seller
  if (sub === "remove") {
    await Shop.destroy({ where: { threadID, seller: senderID } });
    return api.sendMessage("✅ Your shop entry has been removed.", threadID);
  }

  // 📋 List sellers
  if (sub === "list") {
    const sellers = await Shop.findAll({ where: { threadID } });
    if (sellers.length === 0) {
      return api.sendMessage("📭 No active sellers in this shop.", threadID);
    }

    let listMsg = `🛒 ACTIVE SHOP SELLERS (This GC) 🛒\n\n`;
    for (let i = 0; i < sellers.length; i++) {
      const s = sellers[i];
      const account = await Bank.findOne({ where: { userID: s.seller } });
      const balance = account ? account.balance : 0;
      const fbLink = `https://www.facebook.com/profile.php?id=${s.seller}`;
      listMsg += `${i + 1}. 👤 ${s.name}\n🔗 FB: ${fbLink}\n📦 ${s.details.join(", ")}\n💰 Balance: ${balance.toLocaleString()} coins\n\n`;
    }

    if (nextPostTime) {
      const timeString = nextPostTime.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      listMsg += `\n⏰ Next auto post: ${timeString}`;
    }

    return api.sendMessage(listMsg, threadID);
  }

  // ➕ Add seller
  if (sub === "add") {
    if (args.length < 2) {
      return api.sendMessage("❌ Usage: /shop add <details>", threadID);
    }

    const detailsText = args.slice(1).join(" ");
    const details = detailsText.split(/\n|,/).map((d) => d.trim()).filter(Boolean);

    let account = await Bank.findOne({ where: { userID: senderID } });
    if (!account || account.balance < 50) {
      return api.sendMessage("❌ You need at least 50 coins to join the auto shop.", threadID);
    }

    const name = await Users.getNameUser(senderID);

    const [entry, created] = await Shop.findOrCreate({
      where: { threadID, seller: senderID },
      defaults: { name, details },
    });

    if (!created) {
      let newDetails = Array.isArray(entry.details) ? entry.details : [];
      details.forEach((d) => {
        if (!newDetails.includes(d)) newDetails.push(d);
      });
      entry.details = newDetails;
      await entry.save();
    }

    return api.sendMessage("✅ Added/updated your shop entry! (50 coins will be deducted every 20 mins)", threadID);
  }
};

// 🔄 Auto poster
module.exports.handleEvent = async function ({ api, models }) {
  if (started) return;
  started = true;

  const { Shop, Bank } = models;

  setInterval(async () => {
    const sellers = await Shop.findAll();

    // compute next post time
    nextPostTime = new Date(Date.now() + 20 * 60 * 1000);

    // group by threadID
    const groups = {};
    sellers.forEach((s) => {
      if (!groups[s.threadID]) groups[s.threadID] = [];
      groups[s.threadID].push(s);
    });

    for (const threadID of Object.keys(groups)) {
      const sellersList = groups[threadID];
      if (sellersList.length === 0) continue;

      let stillActive = [];
      let postMessage = `🛒 AUTO SHOP POST (Every 20 minutes) 🛒\n\n`;

      for (const s of sellersList) {
        const account = await Bank.findOne({ where: { userID: s.seller } });
        if (!account || account.balance < 50) {
          api.sendMessage(`⚠️ ${s.name}, you have been removed from the auto shop (not enough coins).`, threadID);
          await Shop.destroy({ where: { id: s.id } });
          continue;
        }

        account.balance -= 50;
        await account.save();

        const fbLink = `https://www.facebook.com/profile.php?id=${s.seller}`;
        postMessage += `👤 Seller: ${s.name}\n🔗 FB: ${fbLink}\n📦 ${s.details.join(", ")}\n💰 Balance: ${account.balance.toLocaleString()} coins\n\n━━━━━━━━━━━━━━\n\n`;
        stillActive.push(s);
      }

      if (stillActive.length > 0) {
        const timeString = nextPostTime.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        postMessage += `👉 Want to sell too?\nType: /shop add <details> (50 coins every 20 mins)\n\n⏰ Next post: ${timeString}`;
        api.sendMessage(postMessage, threadID);
      }
    }
  }, 20 * 60 * 1000); // every 20 mins
};
