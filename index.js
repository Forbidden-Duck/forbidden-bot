function loggerPrefix() {
    return require("moment")().format('DD/MM/YY h:mma');
}

const Commando = require("eris.js-commando"); // Command Handler
const { MongoClient } = require("mongodb"); // Database
const settings = require("./tokens.json"); // Tokens and Settings

const bot = new Commando.CommandClient(
    settings.bot.token,
    { maxShards: "auto", restMode: true },
    {
        name: "ForbiddenBot",
        description: "General Statistics Discord Bot",
        owner: "190775609532612608",
        prefix: settings.bot.prefix,
        defaultCommandOptions: {
            ignoreBots: true,
            caseInsensitive: true,
            queues: {
                preCommand: require("./library/preCommand")
            }
        }
    },
    { dirPath: __dirname + "/logs", prefix: loggerPrefix }
);
bot.Logger.log("none", "&-c0&r&-7%&r &-6Loaded!&r");

const loadEvents = require("./library/events/loadEvents");

// Remove max listeners
process.setMaxListeners(0);
// Handle rejects
process.on("unhandledRejection", err => bot.Logger.error(`Uncaught Rejection : `, err));
bot.Logger.on("error", () => { }); // Avoid unhandled rejection
bot.on("warn", bot.Logger.warn); // Handle warnings and errors
bot.on("error", bot.Logger.error);

bot.Logger.log("none", `&-c${Math.floor(Math.random() * 20 + 30)}&r&-7%&r &-6Loaded!&r`);

bot.on("ready", () => {
    // Ready emits again after 30mins?
    // Temporary solution for now, I suppose
    // @ts-ignore
    if (bot.readyEmitCheck == undefined) {
        bot.Logger.log("none", "&-c100&r&-7%&r &-6Loaded!&r");
        loadEvents.ready(bot);
        // @ts-ignore
        bot.readyEmitCheck = true;
    } else {
        bot.Logger.info("Reconnected");
    }
});

bot.on("messageCreate", msg => {
    loadEvents.messageCreate(bot, msg);
});

bot.on("guildCreate", guild => {
    loadEvents.guildCreate(bot, guild);
});

bot.on("guildDelete", guild => {
    loadEvents.guildDelete(bot, guild);
});

bot.on("commandExecute", (cmd, msg, args) => {
    loadEvents.commandExecute(bot, cmd, msg, args);
});

bot.on("commandError", (cmd, msg, err) => {
    loadEvents.commandError(bot, cmd, msg, err);
});

bot.Logger.log("none", `&-c${Math.floor(Math.random() * 20 + 60)}&r&-7%&r &-6Loaded!&r`);

bot.registerGroups([
    new Commando.Group("Basic", "basic"),
    new Commando.Group("Info", "info"),
    new Commando.Group("Config", "config"),
    new Commando.Group("Partners", "partners"),
    new Commando.Group("Staff", "staff"),
    new Commando.Group("Founder", "founder"),

    new Commando.ParentGroup("Discord", "discord"),
    new Commando.Group("Server", "server", "discord"),
    new Commando.Group("User", "user", "discord"),

    new Commando.ParentGroup("Game", "game"),
    new Commando.Group("Account", "account", "game"),
    new Commando.Group("Ow", "ow", "game"),
    new Commando.Group("Csgo", "csgo", "game"),
    new Commando.Group("Mw", "mw", "game"),
    new Commando.Group("Lol", "lol", "game"),
    new Commando.Group("R6", "r6", "game"),
    new Commando.Group("Pubg", "pubg", "game"),
]);
bot.registerCommandsIn(__dirname + "/commands");

const MongoDBProvider = require("./library/provider/MongoDB");
bot.setProvider(new MongoDBProvider({
    host: settings.database.host,
    name: settings.database.name,
    auth: settings.database.auth
}));

bot.connect();
bot.Logger.log("none", `&-c${Math.floor(Math.random() * 20 + 80)}&r&-7%&r &-6Loaded!&r`);