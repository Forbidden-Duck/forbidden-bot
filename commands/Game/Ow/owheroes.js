const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");
const overwatch = require("overwatch-api");
const platforms = ["pc", "xbl", "psn", "switch"];
const params = ["quick", "comp", "params"];
const heroes = [
    { name: "Ana", type: "Support" },
    { name: "Ashe", type: "Damage" },
    { name: "Baptiste", nick: "Bap", type: "Support" },
    { name: "Brigitte", nick: "Brig", type: "Support" },
    { name: "D.Va", nick: "Dva", type: "Tank" },
    { name: "Doomfist", nick: "Doom", type: "Damage" },
    { name: "Echo", type: "Damage" },
    { name: "Genji", type: "Damage" },
    { name: "Hanzo", type: "Damage" },
    { name: "Junkrat", nick: "Junk", type: "Damage" },
    { name: "Lúcio", nick: "Lucio", type: "Support" },
    { name: "McCree", nick: "Cree", type: "Damage" },
    { name: "Mei", nick: "Demon", type: "Damage" },
    { name: "Mercy", type: "Support" },
    { name: "Moira", type: "Support" },
    { name: "Orisa", type: "Tank" },
    { name: "Pharah", type: "Damage" },
    { name: "Reaper", type: "Damage" },
    { name: "Reinhardt", nick: "Rein", type: "Tank" },
    { name: "Roadhog", nick: "Hog", type: "Tank" },
    { name: "Sigma", nick: "Sig", type: "Tank" },
    { name: "Soldier: 76", nick: "Soldier", type: "Damage" },
    { name: "Sombra", type: "Damage" },
    { name: "Symmetra", nick: "Sym", type: "Damage" },
    { name: "Torbjörn", nick: "Torb", type: "Damage" },
    { name: "Tracer", type: "Damage" },
    { name: "Widowmaker", nick: "Widow", type: "Damage" },
    { name: "Winston", type: "Tank" },
    { name: "Wrecking Ball", nick: "Hammond", type: "Tank" },
    { name: "Zarya", type: "Tank" },
    { name: "Zenyatta", nick: "Zen", type: "Support" },
];

module.exports = class OwHeroes extends Commando.Command {
    constructor(bot) {
        super(bot, "owheroes", "ow", {
            description: "Display overwatch hero-specific statistics",
            usage: "owheroes [Hero] [Platform | User] [Name] [-Param]",
            aliases: ["overwatchheroes"]
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
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkDonor(message.author, "is$5")
                && !bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                embed.description = "You must be a Donator to use this command";
                embed.fields = [
                    { name: "Donate today!", value: `\`${prefix}donate\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const heroArg = args[0] && args[0].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const platUsr = args[1] && args[1].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const platUsrLong = args.slice(1).join(" ") && args.slice(1).join(" ").replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const nameArg = args[2] && args[2].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            let param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";
            if (heroArg === "-params") {
                param = "params";
            }

            let viewType = "comp";
            if (params.includes(param.toLowerCase())) {
                if (param.toLowerCase() === "params") {
                    embed.fields.push({ name: "Params", value: params.join(", ") });
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    if (platUsrLong == undefined || platUsrLong.length <= 0) {
                        return;
                    }
                } else {
                    viewType = param;
                }
            }


            if ((heroArg == undefined || heroArg.length <= 0)
                || heroArg.toLowerCase() === "heroes") {
                if (heroArg == undefined || heroArg.length <= 0) {
                    embed.description =
                        "You need to enter a \`hero\`\n" +
                        `\`${prefix}owheroes Reinhardt me\` (${prefix}usage owheroes)`;
                }

                const tankHeroes = heroes.filter(hero => hero.type === "Tank");
                const damageHeroes = heroes.filter(hero => hero.type === "Damage");
                const supportHeroes = heroes.filter(hero => hero.type === "Support");
                embed.fields = [
                    {
                        name: "Tanks",
                        value: tankHeroes
                            .map(hero => `${hero.name}${hero.nick ? ` (${hero.nick})` : ""}`)
                            .join("\n"),
                        inline: true
                    },
                    {
                        name: "Damage",
                        value: damageHeroes
                            .map(hero => `${hero.name}${hero.nick ? ` (${hero.nick})` : ""}`)
                            .join("\n"),
                        inline: true
                    },
                    {
                        name: "Support",
                        value: supportHeroes
                            .map(hero => `${hero.name}${hero.nick ? ` (${hero.nick})` : ""}`)
                            .join("\n"),
                        inline: true
                    },
                ];

                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const hero = heroes
                .find(hero =>
                    hero.name.toLowerCase() === heroArg.toLowerCase()
                    || (hero.nick && hero.nick.toLowerCase() === heroArg.toLowerCase())
                );
            if (hero == undefined) {
                embed.description = `**${heroArg}** isn't a hero I recognise`;
                embed.fields = [
                    {
                        name: "Tip",
                        value: `type \`${prefix}${this.name} heroes\` for all the heroes`
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (platUsr == undefined || platUsr.length <= 0) {
                embed.description = "You need to enter a \`platform\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tip",
                        value: `type \`${prefix}${this.name} platforms\` for all the platforms`
                    },
                    {
                        name: "Examples",
                        value:
                            `\`${prefix}owheroes Reinhardt pc Duck#12641\`\n` +
                            `\`${prefix}owheroes Reinhardt me\``
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
                if (linkedAccounts.overwatch == undefined) {
                    embed.description = "You don't have an Overwatch Account linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink ow\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.overwatch;
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
                    if (userLinked.overwatch == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked Overwatch Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.overwatch;
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
            account.name = account.name.replace(/#/gi, "-");

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let profile;
            let stats;
            try {
                profile = await getProfile(bot, account);
                stats = await getStats(bot, account);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "profile not found":
                        embed.description = "Who is that? I have no idea who they are!";
                        break;
                    case "profile is private":
                        embed.description = "That profile went MIA. Please help me find it";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message });

                if (platUsr.toLowerCase() === "me") {
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $unset: { "linkedAccounts.games.overwatch": "" }
                    }, true);
                    message.channel.createMessage({
                        content: "Overwatch Account Unlinked",
                        embed: embed
                    });
                    return;
                }
                if (account.user != undefined
                    && account.user instanceof Eris.User) {
                    await bot.provider.update("users", { _id: account.user.id }, {
                        $unset: { "linkedAccounts.games.overwatch": "" }
                    }, true);
                }
                message.channel.createMessage({ embed: embed });
                return;
            }

            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(`Loading Statistics for **${account.name}**`);

            if (!profile || !stats) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Profile or Stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    profile: profile,
                    stats: stats
                });
            }

            loadingCMD.delete();
            switch (viewType) {
                case "comp": {
                    const heroExist = heroExists(stats.stats.top_heroes.competitive.played, hero.name);
                    if (heroExist == false) {
                        embed.description = `**${account.name}** hasn't played **${hero.name}** in **${viewType} **yet`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    const heroStats = {
                        played: statToString(findHero(hero.name, "played", stats.stats.top_heroes.competitive), true),
                        games_won: statToString(findHero(hero.name, "games_won", stats.stats.top_heroes.competitive)),
                        win_rate: statToString(findHero(hero.name, "win_rate", stats.stats.top_heroes.competitive)),
                        weapon_accuracy: statToString(findHero(hero.name, "weapon_accuracy", stats.stats.top_heroes.competitive)),
                        eliminations_per_life: statToString(findHero(hero.name, "eliminations_per_life", stats.stats.top_heroes.competitive)),
                        multikill_best: statToString(findHero(hero.name, "multikill_best", stats.stats.top_heroes.competitive)),
                    }

                    embed.title = "Competitive Statistics";
                    embed.description = `\`${prefix}owheroes ${heroArg} ${platUsr} ${nameArg || ""} -quick\` for Quickplay`;
                    embed.thumbnail = {
                        url:
                            heroExist.img
                    };
                    embed.fields = [
                        { name: "Name", value: hero.name, inline: true },
                        { name: "Nick", value: hero.nick || "None", inline: true },
                        { name: "Role", value: hero.type, inline: true },

                        { name: "Games Won", value: heroStats.games_won, inline: true },
                        { name: "Win Rate", value: heroStats.win_rate, inline: true },
                        { name: "Time Played", value: heroStats.played, inline: true },

                        { name: "Elims per Life", value: heroStats.eliminations_per_life, inline: true },
                        { name: "Weapon Accuracy", value: heroStats.weapon_accuracy, inline: true },
                        { name: "Multikill Best", value: heroStats.multikill_best, inline: true },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                case "quick": {
                    const heroExist = heroExists(stats.stats.top_heroes.quickplay.played, hero.name);
                    if (heroExist == false) {
                        embed.description = `**${account.name}** hasn't played **${hero.name}** in **${viewType} **yet`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    const heroStats = {
                        played: statToString(findHero(hero.name, "played", stats.stats.top_heroes.quickplay), true),
                        games_won: statToString(findHero(hero.name, "games_won", stats.stats.top_heroes.quickplay)),
                        weapon_accuracy: statToString(findHero(hero.name, "weapon_accuracy", stats.stats.top_heroes.quickplay)),
                        eliminations_per_life: statToString(findHero(hero.name, "eliminations_per_life", stats.stats.top_heroes.quickplay)),
                        multikill_best: statToString(findHero(hero.name, "multikill_best", stats.stats.top_heroes.quickplay)),
                    }

                    embed.title = "Quickplay Statistics";
                    embed.description = `\`${prefix}owheroes ${heroArg} ${platUsr} ${nameArg || ""} -comp\` for Competitive`;
                    embed.thumbnail = {
                        url:
                            heroExist.img
                    };
                    embed.fields = [
                        { name: "Name", value: hero.name, inline: true },
                        { name: "Nick", value: hero.nick || "None", inline: true },
                        { name: "Role", value: hero.type, inline: true },

                        { name: "Games Won", value: heroStats.games_won, inline: true },
                        { name: "Time Played", value: heroStats.played, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Elims per Life", value: heroStats.eliminations_per_life, inline: true },
                        { name: "Weapon Accuracy", value: heroStats.weapon_accuracy, inline: true },
                        { name: "Multikill Best", value: heroStats.multikill_best, inline: true },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                default:
                    embed.description = "That wasn't supposed to happen";
                    message.channel.createMessage({ embed: embed });
                    break;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        function getProfile(bot, account) {
            return new Promise((resolve, reject) => {
                let ratelimit = bot.util.cache.getCache("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    overwatch.getProfile(account.platform, "global", account.name, (err, res) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(res);
                    });
                } else {
                    resolve(ratelimit.profile);
                }
            });
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        function getStats(bot, account) {
            return new Promise((resolve, reject) => {
                let ratelimit = bot.util.cache.getCache("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameOW", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    overwatch.getStats(account.platform, "global", account.name, (err, res) => {
                        if (err) {
                            return reject(err);
                        }
                        if (res.private == true) {
                            return reject(new Error("Profile is private"));
                        }
                        resolve(res);
                    });
                } else {
                    resolve(ratelimit.stats);
                }
            });
        }

        /** 
         * @param {Array<*>} array 
         * @param {String} name 
         * @returns {Object | false}
        */
        function heroExists(array, name) {
            const hero = array.find(stat => stat.hero === name);
            if (hero == undefined) {
                return false;
            } else {
                return hero;
            }
        }

        /** 
         * @param {String} name 
         * @param {String} stat 
         * @param {*} obj 
        */
        function findHero(name, stat, obj) {
            return (
                obj[stat].find(hero => hero.hero === name)
                    ? obj[stat].find(hero => hero.hero === name)[stat]
                    : undefined);
        }

        /** 
         * @param {*} stat 
         * @param {Boolean} [ifHours]
        */
        function statToString(stat, ifHours) {
            let output = "None";
            if (ifHours == true) {
                const time = stat.split(":");
                if (time.length == 3) {
                    output =
                        `**${time[0].startsWith("0") ? time[0].substring(1) : time[0]}** hours and ` +
                        `**${time[1].startsWith("0") ? time[1].substring(1) : time[1]}** minutes`;
                } else if (time.length == 2) {
                    output =
                        `**${time[0].startsWith("0") ? time[0].substring(1) : time[0]}** minutes and ` +
                        `**${time[1].startsWith("0") ? time[1].substring(1) : time[1]}** seconds`;
                } else if (time.length == 1) {
                    output =
                        `**${time[0].startsWith("0") ? time[0].substring(1) : time[0]}** seconds`;
                } else if (time.length > 0) {
                    output = stat;
                }
            } else {
                if (stat != undefined
                    && !isNaN(stat)) {
                    output = stat.toLocaleString("en-US");
                } else if (stat != undefined
                    && typeof stat === "string") {
                    output = stat;
                }
            }
            return output;
        }
    }
}