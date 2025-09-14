const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const cacheFile = path.join(__dirname, "stlCache.json");

if (!fs.existsSync(cacheFile)) {
  fs.writeFileSync(cacheFile, JSON.stringify({ lastPost: "" }, null, 2));
}

function loadCache() {
  return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
}
function saveCache(data) {
  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
}

module.exports.config = {
  name: "stlcagayan",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Fetch latest STL Cagayan results from FB page",
  commandCategory: "lotto",
  usages: "/stlcagayan",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  const result = await fetchSTLCagayan();
  if (result) {
    api.sendMessage("📢 Latest STL Cagayan Result:\n\n" + result, event.threadID);
  } else {
    api.sendMessage("⚠️ Could not fetch STL Cagayan result right now.", event.threadID);
  }
};

let started = false;
module.exports.handleEvent = async function ({ api }) {
  if (started) return;
  started = true;

  setInterval(async () => {
    const result = await fetchSTLCagayan();
    if (!result) return;

    const cache = loadCache();
    if (result !== cache.lastPost) {
      cache.lastPost = result;
      saveCache(cache);

      const threads = await api.getThreadList(50, null, ["INBOX"]);
      const groupThreads = threads.filter(t => t.isGroup);

      for (const t of groupThreads) {
        api.sendMessage("📢 [AUTO] STL Cagayan Result Update:\n\n" + result, t.threadID);
        await new Promise(res => setTimeout(res, 1200));
      }
    }
  }, 5 * 60 * 1000);
};

async function fetchSTLCagayan() {
  try {
    const url = "https://www.facebook.com/STLCagayanProvince";  // use the correct FB page link
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait for posts to load
    await page.waitForSelector("div[role='article']", { timeout: 15000 });

    const posts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div[role='article']"))
        .map(el => el.innerText)
        .filter(text => text && text.trim().length > 0);
    });

    await browser.close();

    // find a post that looks like STL Cagayan result
    const resultPost = posts.find(p => /STL\s+Cagayan/i.test(p));
    return resultPost || null;
  } catch (err) {
    console.error("❌ STL Scraper Error:", err.message);
    return null;
  }
}
