const { Check } = global.models; // gamitin global models

// 🔹 Function to convert count → rank
function getRankName(count) {
  if (count >= 50000) return "War Generals";
  if (count >= 9000) return "Master";
  if (count >= 8000) return "Elite 5";
  if (count >= 6100) return "Elite 4";
  if (count >= 5900) return "Elite 3";
  if (count >= 5700) return "Elite 2";
  if (count >= 5200) return "Elite 1";
  if (count >= 5000) return "Diamond 5";
  if (count >= 4800) return "Diamond 4";
  if (count >= 4500) return "Diamond 3";
  if (count >= 4000) return "Diamond 2";
  if (count >= 3800) return "Diamond 1";
  if (count >= 3500) return "Platinum 4";
  if (count >= 3200) return "Platinum 3";
  if (count >= 3000) return "Platinum 2";
  if (count >= 2900) return "Platinum 1";
  if (count >= 2500) return "Gold 4";
  if (count >= 2300) return "Gold 3";
  if (count >= 2000) return "Gold 2";
  if (count >= 1500) return "Gold 1";
  if (count >= 1200) return "Silver 3";
  if (count >= 1000) return "Silver 2";
  if (count >= 900) return "Silver 1";
  if (count >= 500) return "Copper 3";
  if (count >= 100) return "Copper 2";
  if (count >= 10) return "Copper 1";
  return "Unranked";
}

module.exports.config = {
  name: "check",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Jaylord",
  description: "Check user stats and ranking by message count",
  commandCategory: "Stats",
  usages: "/check, /check @tag, /check all, /check rank",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID, mentions } = event;
  const query = args[0] ? args[0].toLowerCase() : "";

  // ✅ Mali ang gamit ng command
  const validArgs = ["", "all", "rank"];
  if (!validArgs.includes(query)) {
    return api.sendMessage(
      "❌ Invalid usage.\n\n" +
      "📌 Correct Usage:\n" +
      "• /check → show your stats\n" +
      "• /check @tag → show tagged user's stats\n" +
      "• /check all → show all members' stats\n" +
      "• /check rank → show rank list",
      threadID
    );
  }

  // 🔹 Kunin lahat ng data ng users sa thread
  const rows = await Check.findAll({ where: { threadID } });
  let storage = [];

  for (const row of rows) {
    const name = await Users.getNameUser(row.userID);
    storage.push({ id: row.userID, name, count: row.count });
  }

  // 🔹 Sort by count (desc)
  storage.sort((a, b) => {
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    return a.name.localeCompare(b.name);
  });

  let msg = "";

  if (query === "all") {
    msg = "=== CHECK ===";
    let rank = 1;
    for (const user of storage) {
      msg += `\n${rank++}. ${user.name} - ${user.count}`;
    }
  } else if (query === "rank") {
    msg =
      "🏆 Rank List 🏆\n" +
      "Copper 1 (10 msgs)\nCopper 2 (100 msgs)\nCopper 3 (500 msgs)\n" +
      "Silver 1 (900 msgs)\nSilver 2 (1000 msgs)\nSilver 3 (1200 msgs)\n" +
      "Gold 1 (1500 msgs)\nGold 2 (2000 msgs)\nGold 3 (2300 msgs)\nGold 4 (2500 msgs)\n" +
      "Platinum 1 (2900 msgs)\nPlatinum 2 (3000 msgs)\nPlatinum 3 (3200 msgs)\nPlatinum 4 (3500 msgs)\n" +
      "Diamond 1 (3800 msgs)\nDiamond 2 (4000 msgs)\nDiamond 3 (4500 msgs)\nDiamond 4 (4800 msgs)\nDiamond 5 (5000 msgs)\n" +
      "Elite 1 (5200 msgs)\nElite 2 (5700 msgs)\nElite 3 (5900 msgs)\nElite 4 (6100 msgs)\nElite 5 (8000 msgs)\n" +
      "Master (9000 msgs)\nWar Generals (50000 msgs)";
  } else {
    // Default (self or tagged user)
    let userID = senderID;
    if (Object.keys(mentions).length > 0) {
      userID = Object.keys(mentions)[0];
    }
    const rankUser = storage.findIndex((e) => e.id == userID);
    if (rankUser === -1) {
      msg = "❌ No data for this user.";
    } else {
      msg = `${userID == senderID ? "💠Friend" : storage[rankUser].name} ranked ${rankUser + 1
        }\n💌Number of messages: ${storage[rankUser].count}\n🔰Rank ${getRankName(storage[rankUser].count)}`;
    }
  }

  return api.sendMessage(msg, threadID);
};
