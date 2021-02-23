const Eris = require("eris");
const Commando = require("eris.js-commando");
const callofduty = require("call-of-duty-api")();
const moment = require("moment");
const tokens = require("../../../tokens.json");
const platforms = ["acti", "battle", "xbl", "psn"];
const params = {
    list: ["mp", "br", "pl", "params"],
    details: {
        mp: "Multiplayer Statistics",
        br: "Battle-Royale Statistics",
        pl: "Plunder Statistics"
    }
};
const modes = {
    br: {
        name: "Battle Royale",
        find: obj => obj.mode["br"].properties
    },
    pl: {
        name: "Plunder",
        find: obj => obj.mode["br_dmz"].properties
    }
};

module.exports = class Mw extends Commando.Command {
    constructor(bot) {
        super(bot, "mw", "mw", {
            description: "Display modern warfare-specific statistics",
            usage: "mw [Platform | User] [Name] [-Param]",
            aliases: ["modernwarfare"]
        });
    }

    /**
     * @param {Eris.Message} message 
     * @param {Array<String>} args
    */
    async execute(message, args) {
        if (message.channel instanceof Eris.TextChannel
            || message.channel instanceof Eris.PrivateChannel) {
            const bot = this.client;
            const prefix = bot.util.useful.getPrefix(message.guildID);
            const paramRegex = /[ ]-{1,2}[a-zA-Z]*/m;

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                thumbnail: {
                    url: "https://i.imgur.com/5y7IJ5e.png"
                },
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const platUsr = args[0] && args[0].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const platUsrLong = args.join(" ") && args.join(" ").replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const nameArg = args[1] && args[1].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";

            let viewType = "mp";
            if (params.list.includes(param.toLowerCase())) {
                if (param.toLowerCase() === "params") {
                    embed.description =
                        `Use params simply like ` +
                        `\`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -param\``
                    embed.fields.push({
                        name: "Params",
                        value:
                            params.list
                                .map(param => `\`${param}\`${params.details[param] ? ` - ${params.details[param]}` : ""}`)
                                .join("\n")
                    });
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    if (platUsrLong == undefined || platUsrLong.length <= 0) {
                        return;
                    }
                } else {
                    viewType = param;
                }
            }

            if (platUsr == undefined || platUsr.length <= 0) {
                embed.description = "You need to enter a \`platform\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tip",
                        value: `type \`${prefix}${this.name} platforms\` for all the platforms`
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (platUsr.toLowerCase() === "platforms") {
                embed.fields = [
                    { name: "Platforms", value: platforms.join(", ") }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const linkedAccounts = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0]
                .linkedAccounts.games || {};

            let account = {
                name: undefined,
                platform: undefined
            }

            if (platUsr.toLowerCase() === "me") {
                if (linkedAccounts.modernwarfare == undefined) {
                    embed.description = "You don't have an Modern Warfare Account linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink mw\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.modernwarfare;
            } else if (platforms.includes(platUsr.toLowerCase())) {
                account.platform = platforms.find(plat => plat === platUsr.toLowerCase());
            } else {
                const parsedUser = bot.util.parse.userParse({
                    arg: platUsrLong,
                    mentions: message.mentions
                }, { id: true, name: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    const userLinked = (await bot.provider.find("users", { _id: parsedUser.id }, { limit: 1 }, true))[0]
                        .linkedAccounts.games || {};
                    if (userLinked.modernwarfare == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked Modern Warfare Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.modernwarfare;
                    account.user = parsedUser;
                }
            }

            if (account.platform == undefined) {
                embed.description = "Invalid \`platform\` or \`user\` provided";
                embed.fields = [
                    {
                        name: "Tip",
                        value: `type \`${prefix}${this.name} platforms\` for all the platforms`,
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (account.name == undefined) {
                if (nameArg == undefined || nameArg.length <= 0) {
                    embed.description = "You need to enter a name";
                    embed.fields = [
                        { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account.name = nameArg;
            }

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let mp;
            let wz;
            try {
                mp = await getMP(bot, account);
                wz = await getWZ(bot, account);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "request failed with status code 404":
                        embed.description = "Platform or username not found";
                        break;
                    case "user not found.":
                        embed.description = "Oh wow, there is nothing. Please input a valid username";
                        break;
                    case "404 - not found. incorrect username or platform? misconfigured privacy settings?":
                        embed.description = "Oh wow, there is nothing. Please input a valid username";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message });

                if (platUsr.toLowerCase() === "me") {
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $unset: { "linkedAccounts.games.modernwarfare": "" }
                    }, true);
                    message.channel.createMessage({
                        content: "Modern Warfare Account Unlinked",
                        embed: embed
                    });
                    return;
                }
                if (account.user != undefined
                    && account.user instanceof Eris.User) {
                    await bot.provider.update("users", { _id: account.user.id }, {
                        $unset: { "linkedAccounts.games.modernwarfare": "" }
                    }, true);
                }
                message.channel.createMessage({ embed: embed });
                return;
            }

            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(`Loading Statistics for **${account.name}**`);

            if (!mp || !wz) {
                loadingCMD.delete();
                embed.description = "I was unable to find your MP or WZ stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    mp: mp,
                    wz: wz
                });
            }

            loadingCMD.delete();
            if (viewType === "mp") {
                embed.description =
                    `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -br\` for Battle Royale\n` +
                    `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -pl\` for Plunder\n\n` +
                    `**${mp.username}** has eliminated themselves **${mp.lifetime.all.properties.suicides}** times`;
                embed.fields = [
                    { name: "Username", value: mp.username, inline: true },
                    { name: "Level", value: mp.level, inline: true },
                    { name: "Platform", value: mp.platform, inline: true },
                    { name: "Kills", value: mp.lifetime.all.properties.kills, inline: true },
                    { name: "Deaths", value: mp.lifetime.all.properties.deaths, inline: true },
                    { name: "Kill/Death Ratio", value: mp.lifetime.all.properties.kdRatio.toFixed(2), inline: true },
                    { name: "Wins", value: mp.lifetime.all.properties.wins, inline: true },
                    { name: "Losses", value: mp.lifetime.all.properties.losses, inline: true },
                    { name: "Win/Lose Ratio", value: mp.lifetime.all.properties.wlRatio.toFixed(2), inline: true },
                    { name: "Shots", value: mp.lifetime.all.properties.totalShots, inline: true },
                    { name: "Misses", value: mp.lifetime.all.properties.misses, inline: true },
                    { name: "Accuracy", value: `${(mp.lifetime.all.properties.accuracy * 100).toFixed(0)}%`, inline: true },

                    { name: "Best Kills in a match", value: mp.lifetime.all.properties.recordKillsInAMatch, inline: true },
                    { name: "Best Killstreak in a match", value: mp.lifetime.all.properties.recordKillStreak, inline: true },
                    // Add an empty field
                    { name: "\u200b", value: "\u200b", inline: true },

                    { name: "Best Winstreak", value: mp.lifetime.all.properties.recordLongestWinStreak, inline: true },
                    { name: "Current Winstreak", value: mp.lifetime.all.properties.currentWinStreak, inline: true },
                    // Add an empty field
                    { name: "\u200b", value: "\u200b", inline: true },
                ];
                message.channel.createMessage({ embed: embed });
            } else if (["br", "pl"].includes(viewType)) {
                const mode = modes[param].find(wz.lifetime);

                let timePlayed;
                if (mode.timePlayed != undefined) {
                    let minutes = Math.floor((mode.timePlayed / 60) % 60);
                    let hours = Math.floor((mode.timePlayed / 3600) % 24);
                    if (hours < 1) {
                        timePlayed = `${minutes} minutes`;
                    } else {
                        timePlayed = `${hours} hours and ${minutes} minutes`;
                    }
                }

                embed.description =
                    `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -mp\` for Multiplayer\n` +
                    `Displaying **${modes[param].name}** stats for **${account.name}**`;
                embed.fields = [
                    { name: "Kills", value: mode.kills, inline: true },
                    { name: "Deaths", value: mode.deaths, inline: true },
                    { name: "Kill/Death Ratio", value: mode.kdRatio.toFixed(2), inline: true },
                    { name: "Wins", value: mode.wins, inline: true },
                    { name: "Downs", value: mode.downs, inline: true },
                    { name: "Revives", value: mode.revives, inline: true },
                    { name: "Top 5", value: mode.topFive, inline: true },
                    { name: "Top 10", value: mode.topTen, inline: true },
                    { name: "Top 25", value: mode.topTwentyFive, inline: true },
                    { name: "Score", value: mode.score, inline: true },
                    { name: "Score per minute", value: mode.scorePerMinute.toFixed(0), inline: true },
                    // Add an empty field
                    { name: "\u200b", value: "\u200b", inline: true },
                    { name: "Games Played", value: mode.gamesPlayed, inline: true },
                    { name: "Time Played", value: timePlayed || "None", inline: true },
                    // Add an empty field
                    { name: "\u200b", value: "\u200b", inline: true },
                ];
                message.channel.createMessage({ embed: embed });
            } else {
                embed.description = "That wasn't supposed to happen";
                message.channel.createMessage({ embed: embed });
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        function getMP(bot, account) {
            return new Promise((resolve, reject) => {
                let ratelimit = bot.util.cache.getCache("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    callofduty.login(tokens.accounts.activision.username, tokens.accounts.activision.password)
                        .then(() => {
                            callofduty.MWmp(account.name, callofduty.platforms[account.platform])
                                .then((profile, err) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(profile);
                                }).catch(err => reject(new Error(err)));
                        }).catch(err => reject(new Error(err)));
                } else {
                    resolve(ratelimit.mp);
                }
            });
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        function getWZ(bot, account) {
            return new Promise((resolve, reject) => {
                let ratelimit = bot.util.cache.getCache("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameMW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    callofduty.login(tokens.accounts.activision.username, tokens.accounts.activision.password)
                        .then(() => {
                            callofduty.MWwz(account.name, callofduty.platforms[account.platform])
                                .then((profile, err) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(profile);
                                });
                        });
                } else {
                    resolve(ratelimit.wz);
                }
            });
        }
    }
}