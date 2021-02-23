const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");
const moment = require("moment");
const tokens = require("../../../tokens.json");
const regions = ["na", "lan", "las", "eune", "euw", "oce", "br", "jp", "kr", "tr", "ru"];
const matchRegionsTo = {
    na: "na1",
    lan: "la1",
    las: "la2",
    eune: "eun1",
    euw: "euw1",
    oce: "oc1",
    br: "br1",
    jp: "jp1",
    kr: "kr",
    tr: "tr1",
    ru: "ru1"
};
const emojiGuildID = "505583975826325515";

module.exports = class Lol extends Commando.Command {
    constructor(bot) {
        super(bot, "lol", "lol", {
            description: "Display league-specific statistics",
            usage: "lol [Region | User] [Name] [Champion]",
            aliases: ["league", "leagueoflegends"]
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

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const regUsr = args[0];
            const regUserLong = args.slice(1).join(" ");
            const nameArg = args[1];
            let chmpArg = args[2] || nameArg;
            if (args.length > 3) {
                chmpArg = args[args.length - 1];
            }

            if (regUsr == undefined || regUsr.length <= 0) {
                embed.description = "You need to enter a \`region\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tips",
                        value:
                            `type \`${prefix}${this.name} regions\` for all available regions\n` +
                            `type \`${prefix}${this.name} champions\` for all available champions`
                    },
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` },
                    { name: "Example", value: `\`${prefix}lol me\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            let versions;
            let championsList;
            try {
                versions = await superagent.get("https://ddragon.leagueoflegends.com/api/versions.json")
                    .then(res => res.body);

                if (bot.util.cache.getCache("gameLOLCHAMPIONS", versions[0], 0) == undefined) {
                    championsList = await superagent.get(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`)
                        .then(res => res.body.data);
                } else {
                    championsList = bot.util.cache.getCache("gameLOLCHAMPIONS", versions[0], 0)
                }
            } catch (err) {
                embed.description = "Failed to grab the list of all available champions";
                embed.fields = [
                    { name: "Error", value: err }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            bot.util.cache.addCache("gameLOLCHAMPIONS", versions[0], 0, championsList);

            if (regUsr.toLowerCase() === "regions"
                || (nameArg && nameArg.toLowerCase() === "regions")
                || (chmpArg && chmpArg.toLowerCase() === "regions")) {
                embed.fields = [
                    { name: "Regions", value: regions.join(", ") }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (regUsr.toLowerCase() === "champions"
                || (nameArg && nameArg.toLowerCase() === "champions")
                || (chmpArg && chmpArg.toLowerCase() === "champions")) {
                let champsArr = [[], [], []];
                let rowIndex = 0;
                for (const champ in championsList) {
                    const champName = championsList[champ].id;
                    champsArr[rowIndex].push(champName);
                    rowIndex++;
                    if (rowIndex >= 3) {
                        rowIndex = 0;
                    }
                }

                embed.description = "For a more detailed list visit https://na.leagueoflegends.com/en-us/champions/";
                embed.fields = [
                    { name: "Champions List", value: champsArr[0].join(", "), inline: true },
                    { name: "\u200b", value: champsArr[1].join(", "), inline: true },
                    { name: "\u200b", value: champsArr[2].join(", "), inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const linkedAccounts = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0]
                .linkedAccounts.games || {};
            let account = {
                name: undefined,
                region: undefined
            }

            if (regUsr.toLowerCase() === "me") {
                if (linkedAccounts.leagueoflegends == undefined) {
                    embed.description = "You don't have an League of Legends Account linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink lol\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.leagueoflegends;
            } else if (regions.includes(regUsr.toLowerCase())) {
                account.region = regions.find(reg => reg === regUsr.toLowerCase());
            } else {
                const parsedUser = bot.util.parse.userParse({
                    arg: regUsr,
                    mentions: message.mentions
                }, { id: true, name: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    const userLinked = (await bot.provider.find("users", { _id: parsedUser.id }, { limit: 1 }, true))[0]
                        .linkedAccounts.games || {};
                    if (userLinked.leagueoflegends == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked League of Legends Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.leagueoflegends;
                    account.user = parsedUser;
                }
            }

            if (account.region == undefined) {
                embed.description = "Invalid \`region\` or \`user\` provided";
                embed.fields = [
                    {
                        name: "Tip",
                        value: `type \`${prefix}${this.name} regions\` for all the regions`,
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
            } else {
                account.name = decodeURIComponent(account.name);
            }

            let viewType = "global";
            const viewTypeValue = {
                champion: undefined
            };
            if ((nameArg && nameArg.length > 0) || (chmpArg && chmpArg.length > 0)) {
                const champKeys = Object.values(championsList).map(key => key.id.toLowerCase());
                if ((nameArg && nameArg.length > 0) && champKeys.includes(nameArg.toLowerCase())) {
                    viewType = "champion";
                    viewTypeValue.champion = champKeys.find(chmp => chmp === nameArg.toLowerCase());
                } else if ((chmpArg && chmpArg.length > 0) && champKeys.includes(chmpArg.toLowerCase())) {
                    viewType = "champion";
                    viewTypeValue.champion = champKeys.find(chmp => chmp === chmpArg.toLowerCase());
                } else {
                    if (!regions.includes(regUsr.toLowerCase())) {
                        embed.description = `**${chmpArg || regUsr}** is not a valid \`champion\``;
                        embed.fields = [
                            {
                                name: "Tip",
                                value:
                                    `type \`${prefix}${this.name} champions\` for all available champions`
                            }
                        ];
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                }
            }
            if (regions.includes(regUsr.toLowerCase())
                && args.length >= 3) {
                if (viewTypeValue.champion == undefined) {
                    account.name = regUserLong;
                } else {
                    account.name = regUserLong.split(" ").slice(0, args.slice(1).length - 1).join(" ");
                }
            }
            account.name = encodeURIComponent(account.name);

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let summoner;
            let stats;
            let champStats;
            try {
                summoner = await getSummonerByName(bot, account);
                stats = await getStats(bot, account, summoner.id);
                champStats = await getChampStats(bot, account, summoner.id);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "cannot read property 'id' of undefined":
                        embed.description = "You don't look like a summoner I know. Please enter a valid summoner name";
                        break;
                    case "not found":
                        embed.description = "You don't look like a summoner I know. Please enter a valid summoner name";
                        break;
                    case "bad request":
                        embed.description = "You don't look like a summoner I know. Please enter a valid summoner name";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message || "None" });

                if (regUsr.toLowerCase() === "me") {
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $unset: { "linkedAccounts.games.leagueoflegends": "" }
                    }, true);
                    message.channel.createMessage({
                        content: "League of Legends Account Unlinked",
                        embed: embed
                    });
                    return;
                }
                if (account.user != undefined
                    && account.user instanceof Eris.User) {
                    await bot.provider.update("users", { _id: account.user.id }, {
                        $unset: { "linkedAccounts.games.leagueoflegends": "" }
                    }, true);
                }
                message.channel.createMessage({ embed: embed });
                return;
            }

            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(
                `Loading Statistics for **${account.name}**` +
                `${viewType === "champion"
                    ? ` on the champion **${viewTypeValue.champion}**`
                    : ""}`
            );

            if (stats == undefined) {
                loadingCMD.delete();
                embed.description = `**${account.name}** hasn't played any ranked matches yet`;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (summoner == undefined || champStats == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Summoner Profile, Stats or Champion Stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    profile: summoner,
                    stats: stats,
                    champStats: champStats
                });
            }

            loadingCMD.delete();
            switch (viewType) {
                case "global": {
                    let tierName;
                    let tierEmote;
                    if (stats.tier) {
                        const allEmojis = bot.guilds.get(emojiGuildID).emojis;
                        tierName = stats.tier.charAt(0) + stats.tier.toLowerCase().substring(1, stats.tier.length);
                        tierEmote = allEmojis.find(emote => emote.name === `LoL${tierName}Tier`);
                    }

                    let champCount = 0;
                    const topChampions = [];
                    for (const champ of champStats) {
                        if (champCount >= 3) {
                            break;
                        }
                        const championFound = Object.values(championsList).find(list => parseInt(list.key) == champ.championId);
                        topChampions.push({ list: championFound, stat: champ });
                        champCount++;
                    }

                    embed.thumbnail = {
                        url:
                            `https://lolg-cdn.porofessor.gg/img/summonerIcons/10.22/64/${summoner.profileIconId}.png`
                            || message.author.avatarURL
                    };
                    embed.fields = [
                        { name: "Username", value: summoner.name, inline: true },
                        { name: "Region", value: account.region, inline: true },
                        { name: "Level", value: summoner.summonerLevel, inline: true },

                        { name: "Wins", value: stats.wins || "Unranked", inline: true },
                        { name: "Losses", value: stats.losses || "Unranked", inline: true },
                        {
                            name: "Win/Lose Ratio",
                            value:
                                stats.wins == undefined || stats.losses == undefined
                                    ? "Unranked"
                                    : (stats.wins / stats.losses).toFixed(2),
                            inline: true
                        },

                        {
                            name: "Tier",
                            value:
                                `${tierEmote
                                    ? tierEmote.animated
                                        ? `<a:${tierEmote.name}:${tierEmote.id}>`
                                        : `<:${tierEmote.name}:${tierEmote.id}>`
                                    : ""} ${tierName || "Unranked"}`,
                            inline: true
                        },
                        { name: "Rank", value: stats.rank || "Unranked", inline: true },
                        { name: "League Points", value: stats.wins || "Unranked", inline: true }
                    ];
                    topChampions.forEach((champ, index) => {
                        embed.fields.push(
                            {
                                name: `${champ.list.name}\nChampion #${index + 1}`,
                                value:
                                    `**Level**: ${champ.stat.championLevel
                                        ? champ.stat.championLevel.toLocaleString("en-US")
                                        : "Unranked"}\n` +
                                    `**Points** ${champ.stat.championPoints
                                        ? champ.stat.championPoints.toLocaleString("en-US")
                                        : "Unranked"}`,
                                inline: true
                            }
                        );
                    });
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                case "champion": {
                    const championOnList = Object.values(championsList).find(list => list.id.toLowerCase() === viewTypeValue.champion);
                    const champ = champStats.find(champ => parseInt(championOnList.key) == champ.championId);
                    if (champ == undefined) {
                        embed.description = `**${summoner.name}** hasn't got any statistics for **${championOnList.name}**`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    embed.description = `Champion Statistics for **${summoner.name}**`;
                    embed.thumbnail = {
                        url: `http://ddragon.leagueoflegends.com/cdn/10.16.1/img/champion/${championOnList.image.full}`
                    };
                    embed.fields = [
                        { name: "Name", value: championOnList.name, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        { name: "Tags", value: championOnList.tags.join(", "), inline: true },

                        { name: "Level", value: champ.championLevel, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        {
                            name: "Points", value: champ.championPoints
                                ? champ.championPoints.toLocaleString("en-US")
                                : 0, inline: true
                        },

                        {
                            name: "Since Last Level", value: champ.championPointsSinceLastLevel
                                ? champ.championPointsSinceLastLevel.toLocaleString("en-US")
                                : 0, inline: true
                        },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        {
                            name: "Until Next Level", value: champ.championPointsUntilNextLevel
                                ? champ.championPointsUntilNextLevel.toLocaleString("en-US")
                                : 0, inline: true
                        },

                        { name: "Played Last", value: moment(champ.lastPlayTime).format('MMMM Do YYYY, h:mma') },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                default:
                    embed.description = "That wasn't supposed to happen";
                    message.channel.createMessage({
                        content: "",
                        embed: embed
                    });
                    break;
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        async function getSummonerByName(bot, account) {
            let ratelimit = bot.util.cache.getCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)
                || ratelimit.profile == undefined) {
                let result = await superagent.get(
                    `https://${matchRegionsTo[account.region]}.api.riotgames.com` +
                    `/lol/summoner/v4/summoners/by-name/${account.name}` +
                    `?api_key=${tokens.accounts.riot}`);
                return result.body
            } else {
                return ratelimit.profile;
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
         * @param {String} accountID
        */
        async function getStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)
                || ratelimit.stats == undefined) {
                let result = await superagent.get(
                    `https://${matchRegionsTo[account.region]}.api.riotgames.com/` +
                    `lol/league/v4/entries/by-summoner/${accountID}` +
                    `?api_key=${tokens.accounts.riot}`);
                return Array.isArray(result.body) ? result.body[0] : result.body;
            } else {
                return ratelimit.stats;
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
         * @param {String} accountID
        */
        async function getChampStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)
                || ratelimit.champStats == undefined) {
                let result = await superagent.get(
                    `https://${matchRegionsTo[account.region]}.api.riotgames.com` +
                    `/lol/champion-mastery/v4/champion-masteries/by-summoner/${accountID}` +
                    `?api_key=${tokens.accounts.riot}`);
                return result.body;
            } else {
                return ratelimit.champStats;
            }
        }
    }
}