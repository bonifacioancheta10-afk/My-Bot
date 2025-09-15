const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const logger = require("./utils/log.js");
const login = require("fca-smart-shankar"); 
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleSchedule: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime(option) {
    switch (option) {
      case "seconds": return moment.tz("Asia/Kolkata").format("ss");
      case "minutes": return moment.tz("Asia/Kolkata").format("mm");
      case "hours": return moment.tz("Asia/Kolkata").format("HH");
      case "date": return moment.tz("Asia/Kolkata").format("DD");
      case "month": return moment.tz("Asia/Kolkata").format("MM");
      case "year": return moment.tz("Asia/Kolkata").format("YYYY");
      case "fullHour": return moment.tz("Asia/Kolkata").format("HH:mm:ss");
      case "fullYear": return moment.tz("Asia/Kolkata").format("DD/MM/YYYY");
      case "fullTime": return moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY");
    }
  }
};

global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: [],
  allUserID: [],
  allCurrenciesID: [],
  allThreadID: []
};

global.utils = require("./utils");
global.nodemodule = {};
global.config = {};
global.configModule = {};
global.moduleData = [];
global.language = {};

//========= Load Config =========//
let configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
  logger.loader("Found file config: config.json");
} catch {
  if (existsSync(global.client.configPath.replace(/\.json/g, "") + ".temp")) {
    configValue = readFileSync(global.client.configPath.replace(/\.json/g, "") + ".temp");
    configValue = JSON.parse(configValue);
    logger.loader(`Found: ${global.client.configPath.replace(/\.json/g, "") + ".temp"}`);
  } else return logger.loader("config.json not found!", "error");
}

try {
  for (const key in configValue) global.config[key] = configValue[key];
  logger.loader("Config Loaded!");
} catch {
  return logger.loader("Can't load file config!", "error");
}

writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

//========= Load language =========//
const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
  const getSeparator = item.indexOf('=');
  const itemKey = item.slice(0, getSeparator);
  const itemValue = item.slice(getSeparator + 1, item.length);
  const head = itemKey.slice(0, itemKey.indexOf('.'));
  const key = itemKey.replace(head + '.', '');
  const value = itemValue.replace(/\\n/gi, '\n');
  if (typeof global.language[head] == "undefined") global.language[head] = {};
  global.language[head][key] = value;
}

global.getText = function (...args) {
  const langText = global.language;    
  if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
  let text = langText[args[0]][args[1]];
  for (let i = args.length - 1; i > 0; i--) {
    const regEx = RegExp(`%${i}`, 'g');
    text = text.replace(regEx, args[i + 1]);
  }
  return text;
};

//========= Appstate =========//
let appStateFile, appState;
try {
  appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  appState = require(appStateFile);
  logger.loader(global.getText("priyansh", "foundPathAppstate"));
} catch {
  return logger.loader(global.getText("priyansh", "notFoundPathAppstate"), "error");
}

//========= Login account and start Listen Event =========//
function onBot({ models: botModel }) {
  const loginData = { appState };
  login(loginData, async (loginError, loginApiData) => {
    if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
    loginApiData.setOptions(global.config.FCAOption)
    writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09'))
    global.client.api = loginApiData
    global.config.version = '1.2.14'
    global.client.timeStart = Date.now();

    //========= Load Commands =========//
    const listCommand = readdirSync(global.client.mainPath + '/Rudra/commands').filter(c => c.endsWith('.js') && !c.includes('example') && !global.config.commandDisabled.includes(c));
    for (const command of listCommand) {
      try {
        const module = require(global.client.mainPath + '/Rudra/commands/' + command);
        if (!module.config || !module.run) throw new Error(global.getText('priyansh', 'errorFormat'));
        if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('priyansh', 'nameExist'));
        if (module.onLoad) {
          try {
            module.onLoad({ api: loginApiData, models: botModel });
          } catch (e) {
            throw new Error(global.getText('priyansh', 'cantOnload', module.config.name, JSON.stringify(e)), 'error');
          }
        }
        if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
        global.client.commands.set(module.config.name, module);
        logger.loader(global.getText('priyansh', 'successLoadModule', module.config.name));
      } catch (error) {
        logger.loader(global.getText('priyansh', 'failLoadModule', command, error), 'error');
      }
    }

    //========= Load Events =========//
    const events = readdirSync(global.client.mainPath + '/Rudra/events').filter(e => e.endsWith('.js') && !global.config.eventDisabled.includes(e));
    for (const ev of events) {
      try {
        const event = require(global.client.mainPath + '/Rudra/events/' + ev);
        if (!event.config || !event.run) throw new Error(global.getText('priyansh', 'errorFormat'));
        if (global.client.events.has(event.config.name) || '') throw new Error(global.getText('priyansh', 'nameExist'));
        if (event.onLoad) {
          try {
            event.onLoad({ api: loginApiData, models: botModel });
          } catch (e) {
            throw new Error(global.getText('priyansh', 'cantOnload', event.config.name, JSON.stringify(e)), 'error');
          }
        }
        global.client.events.set(event.config.name, event);
        logger.loader(global.getText('priyansh', 'successLoadModule', event.config.name));
      } catch (error) {
        logger.loader(global.getText('priyansh', 'failLoadModule', ev, error), 'error');
      }
    }

    logger.loader(global.getText('priyansh', 'finishLoadModule', global.client.commands.size, global.client.events.size)) 
    logger.loader(`Startup Time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`)   
    logger.loader('===== [ ' + (Date.now() - global.client.timeStart) + 'ms ] =====')

    writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf8') 
    unlinkSync(global.client.configPath + '.temp');        

    const listener = require('./includes/listen')({ api: loginApiData, models: botModel });
    global.handleListen = loginApiData.listenMqtt((error, message) => {
      if (error) return logger(global.getText('priyansh', 'handleListenError', JSON.stringify(error)), 'error');
      if (['presence', 'typ', 'read_receipt'].includes(message.type)) return;
      if (global.config.DeveloperMode) console.log(message);
      return listener(message);
    });
  });
}

//========= Connecting to Database =========//
const { connectDB } = require("./includes/database");

(async () => {
  try {
    const models = await connectDB();
    logger(global.getText('priyansh', 'successConnectDatabase'), '[ DATABASE ]');
    onBot({ models });
  } catch (error) { 
    logger(global.getText('priyansh', 'failConnectDatabase', JSON.stringify(error)), '[ DATABASE ]'); 
  }
})();

process.on('unhandledRejection', () => {});
