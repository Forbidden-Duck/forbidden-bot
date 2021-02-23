const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");
const overwatch = require("overwatch-api");
const platforms = ["pc", "xbl", "psn", "switch"];
const params = ["quick", "comp", "params"];
const compEmotes = [
    "<:OWBronzeTier:703837278643945472>",
    "<:OWSilverTier:703837279315165268>",
    "<:OWGoldTier:703837278258331720>",
    "<:OWPlatinumTier:703837279315296307>",
    "<:OWDiamondTier:703837278333567068>",
    "<:OWMasterTier:703837279025889361>",
    "<:OWGrandmasterTier:703837280044843018>"
];

module.exports = class Overwatch extends Commando.Command {
    constructor(bot) {
        super(bot, "ow", "ow", {
            description: "Display overwatch-specific statistics",
            usage: "ow [Platform | User] [Name] [-Param]",
            aliases: ["overwatch"]
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

            const platUsr = args[0] && args[0].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const platUsrLong = args.join(" ") && args.join(" ").replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const nameArg = args[1] && args[1].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            let param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";
            if (platUsr === "-params") {
                param = "params";
            }

            let viewType = "global";
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

            /** Profile Formatting */

            let quickPlaytime = 0;
            let compPlaytime = 0;
            if (profile.playtime.quickplay) {
                const quickHours = profile.playtime.quickplay.split(":")[0];
                quickPlaytime = quickPlaytime + parseInt(quickHours);
            }
            if (profile.playtime.competitive) {
                const compHours = profile.playtime.competitive.split(":")[0];
                compPlaytime = compPlaytime + parseInt(compHours);
            }

            const tankRank = profile.competitive.tank.rank;
            const dpsRank = profile.competitive.damage.rank;
            const supportRank = profile.competitive.support.rank;

            const tankIcon =
                profile.competitive.tank.rank_img
                    ? compEmotes.find(item => item.split(":")[1]
                        === `OW${profile.competitive.tank.rank_img.split("rank-")[2].replace(".png", "")}`)
                    : null;
            const dpsIcon =
                profile.competitive.damage.rank_img
                    ? compEmotes.find(item => item.split(":")[1]
                        === `OW${profile.competitive.damage.rank_img.split("rank-")[2].replace(".png", "")}`)
                    : null;
            const supportIcon =
                profile.competitive.support.rank_img
                    ? compEmotes.find(item => item.split(":")[1]
                        === `OW${profile.competitive.support.rank_img.split("rank-")[2].replace(".png", "")}`)
                    : null;

            /** Stats Formatting */

            let topQuickWins = [];
            if (stats.stats.top_heroes && stats.stats.top_heroes.quickplay) {
                const gamesWon = stats.stats.top_heroes.quickplay.games_won;
                if (gamesWon.length > 3) {
                    gamesWon.length = 3;
                }
                gamesWon.map(hero => topQuickWins.push({ name: hero.hero, wins: hero.games_won }));
            }

            let topQuickPlayed = [];
            if (stats.stats.top_heroes && stats.stats.top_heroes.quickplay) {
                const herosPlayed = stats.stats.top_heroes.quickplay.played;
                if (herosPlayed.length > 3) {
                    herosPlayed.length = 3;
                }
                herosPlayed.map(hero => topQuickPlayed.push({ name: hero.hero, played: hero.played }));
            }

            let topCompPlayed = [];
            if (stats.stats.top_heroes && stats.stats.top_heroes.competitive) {
                const herosPlayed = stats.stats.top_heroes.competitive.played;
                if (herosPlayed.length > 3) {
                    herosPlayed.length = 3;
                }
                herosPlayed.map(hero => topCompPlayed.push({ name: hero.hero, played: hero.played }));
            }

            const quickBestStats = {
                kills: stats.stats.best.quickplay.find(title => title.title === "Eliminations - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Eliminations - Most in Game").value).toLocaleString("en-US")
                    : 0,
                dmg_done: stats.stats.best.quickplay.find(title => title.title === "Hero Damage Done - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Hero Damage Done - Most in Game").value).toLocaleString("en-US")
                    : 0,
                heal_done: stats.stats.best.quickplay.find(title => title.title === "Healing Done - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Healing Done - Most in Game").value).toLocaleString("en-US")
                    : 0,
                enviro_done: stats.stats.best.quickplay.find(title => title.title === "Environmental Kills - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Environmental Kills - Most in Game").value).toLocaleString("en-US")
                    : 0,
                final_blow: stats.stats.best.quickplay.find(title => title.title === "Final Blows - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Final Blows - Most in Game").value).toLocaleString("en-US")
                    : 0,
                melee_kills: stats.stats.best.quickplay.find(title => title.title === "Melee Final Blows - Most in Game")
                    ? parseInt(stats.stats.best.quickplay.find(title => title.title === "Final Blows - Most in Game").value).toLocaleString("en-US")
                    : 0
            }

            const compBestStats = {
                kills: stats.stats.best.competitive.find(title => title.title === "Eliminations - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Eliminations - Most in Game").value).toLocaleString("en-US")
                    : 0,
                dmg_done: stats.stats.best.competitive.find(title => title.title === "Hero Damage Done - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Hero Damage Done - Most in Game").value).toLocaleString("en-US")
                    : 0,
                heal_done: stats.stats.best.competitive.find(title => title.title === "Healing Done - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Healing Done - Most in Game").value).toLocaleString("en-US")
                    : 0,
                enviro_done: stats.stats.best.competitive.find(title => title.title === "Environmental Kills - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Environmental Kills - Most in Game").value).toLocaleString("en-US")
                    : 0,
                final_blow: stats.stats.best.competitive.find(title => title.title === "Final Blows - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Final Blows - Most in Game").value).toLocaleString("en-US")
                    : 0,
                melee_kills: stats.stats.best.competitive.find(title => title.title === "Melee Final Blows - Most in Game")
                    ? parseInt(stats.stats.best.competitive.find(title => title.title === "Final Blows - Most in Game").value).toLocaleString("en-US")
                    : 0
            }

            const quickTotalStats = {
                kills: stats.stats.combat.quickplay.find(title => title.title === "Eliminations")
                    ? parseInt(stats.stats.combat.quickplay.find(title => title.title === "Eliminations").value).toLocaleString("en-US")
                    : 0,
                dmg_done: stats.stats.combat.quickplay.find(title => title.title === "Hero Damage Done")
                    ? parseInt(stats.stats.combat.quickplay.find(title => title.title === "Hero Damage Done").value).toLocaleString("en-US")
                    : 0,
                heal_done: stats.stats.assists.quickplay.find(title => title.title === "Healing Done")
                    ? parseInt(stats.stats.assists.quickplay.find(title => title.title === "Healing Done").value).toLocaleString("en-US")
                    : 0
            }

            const compTotalStats = {
                kills: stats.stats.combat.competitive.find(title => title.title === "Eliminations")
                    ? parseInt(stats.stats.combat.competitive.find(title => title.title === "Eliminations").value).toLocaleString("en-US")
                    : 0,
                dmg_done: stats.stats.combat.competitive.find(title => title.title === "Hero Damage Done")
                    ? parseInt(stats.stats.combat.competitive.find(title => title.title === "Hero Damage Done").value).toLocaleString("en-US")
                    : 0,
                heal_done: stats.stats.assists.competitive.find(title => title.title === "Healing Done")
                    ? parseInt(stats.stats.assists.competitive.find(title => title.title === "Healing Done").value).toLocaleString("en-US")
                    : 0
            }

            let topCompWins = [];
            if (stats.stats.top_heroes && stats.stats.top_heroes.competitive) {
                const gamesWon = stats.stats.top_heroes.competitive.games_won;
                if (gamesWon.length > 3) {
                    gamesWon.length = 3;
                }
                gamesWon.map(hero => topCompWins.push({ name: hero.hero, wins: hero.games_won }));
            }

            loadingCMD.delete();
            embed.thumbnail = {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/600px-Overwatch_circle_logo.svg.png"
            };
            switch (viewType) {
                case "global":
                    embed.title = "Global Statistics";
                    embed.description =
                        // Removes existing params from the content
                        `type \`${message.content.replace(/[ ][^\S][-]{1,2}[a-zA-Z]*/m, "")} -quick\` for Quickplay\n` +
                        `type \`${message.content.replace(/[ ][^\S][-]{1,2}[a-zA-Z]*/m, "")} -comp\` for Competitive`;
                    embed.fields = [
                        {
                            name: "Username",
                            // Displays the discriminator if the platform is pc
                            value: `${profile.username}${account.platform === "pc" ? `#${account.name.split("-")[1]}` : ""}`,
                            inline: true
                        },
                        { name: "Level", value: profile.level, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Quickplay Games", value: `**Won**: ${profile.games.quickplay.won}`, inline: true },
                        {
                            name: "Competitive Games",
                            value:
                                `**Won**: ${profile.games.competitive.won}\n` +
                                `**Lost**: ${profile.games.competitive.lost}\n` +
                                `**Win Rate**: ${(profile.games.competitive.won / profile.games.competitive.played * 100).toFixed(0)}%`,
                            inline: true
                        },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Quickplay Playtime", value: `**${quickPlaytime}** Hours`, inline: true },
                        { name: "Competitive Playtime", value: `**${compPlaytime}** Hours`, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Tank\nCompetitive Rank", value: `${tankIcon || "N/A"} ${tankRank}`, inline: true },
                        { name: "Damage\nCompetitive Rank", value: `${dpsIcon || "N/A"} ${dpsRank}`, inline: true },
                        { name: "Support\nCompetitive Rank", value: `${supportIcon || "N/A"} ${supportRank}`, inline: true },

                        {
                            name: "Top Quickplay Heroes",
                            value:
                                topQuickWins.length > 0
                                    ? topQuickWins.map(item => `**${item.name}** Games Won \`${item.wins}\``).join("\n")
                                    : "N/A",
                            inline: true
                        },
                        {
                            name: "Top Competitive Heroes",
                            value:
                                topCompWins.length > 0
                                    ? topCompWins.map(item => `**${item.name}** Games Won \`${item.wins}\``).join("\n")
                                    : "N/A",
                            inline: true
                        }
                    ];
                    message.channel.createMessage({
                        content: "",
                        embed: embed
                    });
                    break;
                case "quick":
                    embed.title = "Quickplay Statistics";
                    embed.description = "";
                    embed.fields = [
                        {
                            name: "Username",
                            // Displays the discriminator if the platform is pc
                            value: `${profile.username}${account.platform === "pc" ? `#${account.name.split("-")[1]}` : ""}`,
                            inline: true
                        },
                        { name: "Level", value: profile.level, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Playtime", value: `**${quickPlaytime}** Hours`, inline: true },
                        { name: "Games Won", value: profile.games.quickplay.won, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Best Eliminations", value: quickBestStats.kills, inline: true },
                        { name: "Best Damage Done", value: quickBestStats.dmg_done, inline: true },
                        { name: "Best Healing Done", value: quickBestStats.heal_done, inline: true },

                        { name: "Best Environment Kills", value: quickBestStats.enviro_done, inline: true },
                        { name: "Best Final Blows", value: quickBestStats.final_blow, inline: true },
                        { name: "Best Melee Kills", value: quickBestStats.melee_kills, inline: true },

                        { name: "Total Eliminations", value: quickTotalStats.kills, inline: true },
                        { name: "Total Damage Done", value: quickTotalStats.dmg_done, inline: true },
                        { name: "Total Healing Done", value: quickTotalStats.heal_done, inline: true },
                    ];
                    if (topQuickPlayed.length > 0) {
                        topQuickPlayed.map(item => {
                            const playSplit = item.played.split(":");
                            if (playSplit.length == 2) {
                                embed.fields.push({
                                    name: item.name,
                                    value:
                                        `**Time Played**: ${parseInt(playSplit[0])} Minutes\n` +
                                        `**Games Won**: ${stats.stats.top_heroes.quickplay.games_won
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.quickplay.games_won
                                                .find(hero => hero.hero === item.name).games_won
                                            : 0}`,
                                    inline: true
                                });
                            } else {
                                embed.fields.push({
                                    name: item.name,
                                    value:
                                        `**Time Played**: ${parseInt(playSplit[0])} Hours\n` +
                                        `**Games Won**: ${stats.stats.top_heroes.quickplay.games_won
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.quickplay.games_won
                                                .find(hero => hero.hero === item.name).games_won
                                            : 0}`,
                                    inline: true
                                });
                            }
                        });
                    }
                    message.channel.createMessage({ embed: embed });
                    break;
                case "comp":
                    embed.title = "Competitive Statistics";
                    embed.description = "";
                    embed.fields = [
                        {
                            name: "Username",
                            // Displays the discriminator if the platform is pc
                            value: `${profile.username}${account.platform === "pc" ? `#${account.name.split("-")[1]}` : ""}`,
                            inline: true
                        },
                        { name: "Level", value: profile.level, inline: true },
                        { name: "Playtime", value: `**${compPlaytime}** Hours`, inline: true },

                        { name: "Won", value: `${profile.games.competitive.won || 0} / ${profile.games.competitive.played || 0}`, inline: true },
                        { name: "Lost", value: profile.games.competitive.lost || 0, inline: true },
                        {
                            name: "Win Percentage",
                            value: `${(profile.games.competitive.won / profile.games.competitive.played * 100).toFixed(0)}%`,
                            inline: true
                        },

                        { name: "Tank\nCompetitive Rank", value: `${tankIcon || "N/A"} ${tankRank}`, inline: true },
                        { name: "Damage\nCompetitive Rank", value: `${dpsIcon || "N/A"} ${dpsRank}`, inline: true },
                        { name: "Support\nCompetitive Rank", value: `${supportIcon || "N/A"} ${supportRank}`, inline: true },

                        { name: "Best Eliminations", value: compBestStats.kills, inline: true },
                        { name: "Best Damage Done", value: compBestStats.dmg_done, inline: true },
                        { name: "Best Healing Done", value: compBestStats.heal_done, inline: true },

                        { name: "Best Environment Kills", value: compBestStats.enviro_done, inline: true },
                        { name: "Best Final Blows", value: compBestStats.final_blow, inline: true },
                        { name: "Best Melee Kills", value: compBestStats.melee_kills, inline: true },

                        { name: "Total Eliminations", value: compTotalStats.kills, inline: true },
                        { name: "Total Damage Done", value: compTotalStats.dmg_done, inline: true },
                        { name: "Total Healing Done", value: compTotalStats.heal_done, inline: true },
                    ];
                    if (topCompPlayed.length > 0) {
                        topCompPlayed.map(item => {
                            const playSplit = item.played.split(":");
                            if (playSplit.length == 2) {
                                embed.fields.push({
                                    name: item.name,
                                    value:
                                        `**Time Played**: ${parseInt(playSplit[0])} Minutes\n` +
                                        `**Games Won**: ${stats.stats.top_heroes.competitive.games_won
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.competitive.games_won
                                                .find(hero => hero.hero === item.name).games_won
                                            : 0}\n` +
                                        `**Win Rate**: ${stats.stats.top_heroes.competitive.win_rate
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.competitive.win_rate
                                                .find(hero => hero.hero === item.name).win_rate
                                            : 0}`,
                                    inline: true
                                });
                            } else {
                                embed.fields.push({
                                    name: item.name,
                                    value:
                                        `**Time Played**: ${parseInt(playSplit[0])} Hours\n` +
                                        `**Games Won**: ${stats.stats.top_heroes.competitive.games_won
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.competitive.games_won
                                                .find(hero => hero.hero === item.name).games_won
                                            : 0}\n` +
                                        `**Win Rate**: ${stats.stats.top_heroes.competitive.win_rate
                                            .find(hero => hero.hero === item.name)
                                            ? stats.stats.top_heroes.competitive.win_rate
                                                .find(hero => hero.hero === item.name).win_rate
                                            : 0}`,
                                    inline: true
                                });
                            }
                        });
                    }
                    message.channel.createMessage({ embed: embed });
                    break;
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
    }
}