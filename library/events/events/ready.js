const superagent = require("superagent");
const tokens = require("../../../tokens.json");
const Commando = require("eris.js-commando");
const quotes = [
    "Rushing B",
    "Planting Bomb",
    "CLUTCHING!",
    "Peeking Mid",
    "Pressing Q",
    "Ultimate Ready",
    "Playing Bastion",
    "Grenade!",
    "Bravo Six Going Dark",
    "Tasks in electrical",
    "Red looking sus",
    "Rip and TEARRR",
    "Oh joy! No power!",
    "CHECK THOSE CORNERS!",
    "I need healing!",
    "The cake is a lie",
    "The numbers, Mason. What do they mean?",
    "YOU DIED",
    "FINISH HIM",
    "Snake? Snake? SNAKE!",
    "Stay awhile and listen!",
    "No Russian.",
    "Inting Botlane",
    "Hotdropping Pochinki",
    "Forbidden was not an imposter",
    "WASTED"
];
const dblVote = require("../../webhook/dblvote");
const bfdVote = require("../../webhook/bfdvote");

/** 
 * @param {Commando.CommandClient} bot 
*/
module.exports = bot => {
    require("../../util/loadUtil")(bot);

    // 1 hour
    // @ts-ignore
    changePresence(bot.clientOptions.prefix, bot).then(() => {
        setInterval(() => {
            changePresence(bot.clientOptions.prefix, bot);
        }, 3600000);
    });

    // 1 hour
    setInterval(() => {
        // @ts-ignore
        bot.util.cache.deleteCache();
        bot.Logger.log("none", "&-3Cache Delete");
    }, 3600000);

    // 30 minutes
    setInterval(() => {
        // 900 MB
        if (parseInt((process.memoryUsage().heapUsed / 1048576).toFixed(2)) >= 900) {
            bot.Logger.error("Process Exit : Memory has exceeded 900 MB");
            process.exit(0);
        }
    }, 1800000);

    /*
    // ONLY ENABLE ON MAIN BOT
    // 30 minutes
    postServerStats(bot.guilds.size, bot).then(() => {
        setInterval(() => {
            postServerStats(bot.guilds.size, bot);
        }, 1800000);
    });
    */

    bot.webhookmngr.listenOn(5000);
    bot.webhookmngr.waitFor(5000, "/dblwebhook", dblVote, tokens.webhook.discordbotlist);
    bot.webhookmngr.waitFor(5000, "/bfdwebhook", bfdVote, tokens.webhook.botsfordiscord);
}

/**
 * @param {String} prefix 
 * @param {Commando.CommandClient} bot 
*/
async function changePresence(prefix, bot) {
    const chosenQuote = quotes[Math.floor(Math.random() * quotes.length)];
    bot.editStatus("online", {
        name: `${chosenQuote} | ${prefix}help`,
        type: 0
    });
    bot.Logger.log("none", `&-3Presence Update&r : &-c${chosenQuote}&r`);
}

/** 
 * @param {Number} servers 
 * @param {Commando.CommandClient} bot 
*/
async function postServerStats(servers, bot) {
    // DISCORD BOT LIST
    try {
        await superagent.post("https://top.gg/api/bots/305203825931845632/stats")
            .set("Authorization", tokens.botlists.discordbotlist)
            .send({ server_count: servers });
        bot.Logger.log("none", "&-3Server Post&r - &-cDBL&r Successful");
    } catch (err) {
        bot.Logger.error(`&-3Server Post&r - &-cDBL&r Failed\n${err.stack}`);
    }

    // BOTS FOR DISCORD
    try {
        await superagent.post("https://botsfordiscord.com/api/bot/305203825931845632")
            .set("Authorization", tokens.botlists.botsfordiscord)
            .send({ server_count: servers });
        bot.Logger.log("none", "&-3Server Post&r - &-cBFD&r Successful");
    } catch (err) {
        bot.Logger.error(`&-3Server Post&r - &-cBFD&r Failed\n${err.stack}`);
    }

    // BOTLIST.SPACE
    try {
        await superagent.post("https://api.botlist.space/v1/bots/305203825931845632")
            .set("Authorization", tokens.botlists["botlist.space"])
            .send({ server_count: servers });
        bot.Logger.log("none", "&-3Server Post&r - &-cBLS&r Successful");
    } catch (err) {
        bot.Logger.error(`&-3Server Post&r - &-cBLS&r Failed\n${err.stack}`);
    }
}