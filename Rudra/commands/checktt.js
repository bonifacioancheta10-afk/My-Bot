module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID, mentions } = event;
  const query = args[0] ? args[0].toLowerCase() : "";

  // ✅ Kapag mali ang paggamit ng command
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

  let rows = getThreadData(threadID);
  let msg = "";
  let storage = [];

  for (const row of rows) {
    const name = await Users.getNameUser(row.userID);
    storage.push({ id: row.userID, name, count: row.count });
  }

  storage.sort((a, b) => {
    if (a.count > b.count) return -1;
    if (a.count < b.count) return 1;
    return a.name.localeCompare(b.name);
  });

  if (query === "all") {
    msg = "=== CHECK ===";
    let rank = 1;
    for (const user of storage) {
      msg += `\n${rank++}. ${user.name} - ${user.count}`;
    }
  } else if (query === "rank") {
    msg = "Copper 1 (10 msgs)\nCopper 2 (100 msgs)\nCopper 3 (500 msgs)\nSilver 1 (900 msgs)\nSilver 2 (1000 msgs)\nSilver 3 (1200 msgs)\nGold 1 (1500 msgs)\nGold 2 (2000 msgs)\nGold 3 (2300 msgs)\nGold 4 (2500 msgs)\nPlatinum 1 (2900 msgs)\nPlatinum 2 (3000 msgs)\nPlatinum 3 (3200 msgs)\nPlatinum 4 (3500 msgs)\nDiamond 1 (3800 msgs)\nDiamond 2 (4000 msgs)\nDiamond 3 (4500 msgs)\nDiamond 4 (4800 msgs)\nDiamond 5 (5000 msgs)\nElite 1 (5200 msgs)\nElite 2 (5700 msgs)\nElite 3 (5900 msgs)\nElite 4 (6100 msgs)\nElite 5 (8000 msgs)\nMaster (9000 msgs)\nWar Generals (50000 msgs)";
  } else {
    let userID = senderID;
    if (Object.keys(mentions).length > 0) {
      userID = Object.keys(mentions)[0];
    }
    const rankUser = storage.findIndex((e) => e.id == userID);
    if (rankUser === -1) {
      msg = "❌ No data for this user.";
    } else {
      msg = `${userID == senderID ? "💠Friend" : storage[rankUser].name} ranked ${rankUser + 1}\n💌Number of messages: ${storage[rankUser].count}\n🔰Rank ${getRankName(storage[rankUser].count)}`;
    }
  }

  api.sendMessage(msg, threadID);
};
