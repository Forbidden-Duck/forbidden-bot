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

module.exports = class LolMatches extends Commando.Command {
    constructor(bot) {
        super(bot, "lolmatches", "lol", {
            description: "Display league match-specific statistics",
            usage: "lolmatches [Region | User] [Name]",
            aliases: ["leaguematches", "leagueoflegendmatches"]
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
            let matchesToShow = 3;
            if (bot.util.rolecheck.checkDonor(message.author, "is$5")
                || bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                matchesToShow = 10;
            }

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
            const nameArg = args.slice(1).join(" ");

            if (regUsr == undefined || regUsr.length <= 0) {
                embed.description = "You need to enter a \`region\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tips",
                        value:
                            `type \`${prefix}${this.name} regions\` for all available regions\n` +
                            `type \`${prefix}${this.name} champions\` for all available champions`
                    },
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (regUsr.toLowerCase() === "regions"
                || (nameArg && nameArg.toLowerCase() === "regions")) {
                embed.fields = [
                    { name: "Regions", value: regions.join(", ") }
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
            account.name = encodeURIComponent(account.name);

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let summoner;
            let matches;
            try {
                summoner = await getSummonerByName(bot, account);
                matches = await getMatches(bot, account, summoner.accountId);
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
            const loadingCMD = await message.channel.createMessage(`Loading Match Statistics for **${account.name}**`);


            if (summoner == undefined || matches == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Summoner Profile, Stats or Champion Stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameLOLM", `${account.region}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameLOLM", `${account.region}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    matches: matches
                });
            }
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    profile: summoner
                });
            }
            matches = matches.matches;

            if (!Array.isArray(matches) || matches.length <= 0) {
                loadingCMD.delete();
                embed.description = `**${account.name}** has not played any matches`;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const matchList = [];
            matches.forEach(match => {
                if (matchList.length == matchesToShow) {
                    return;
                }
                matchList.push(match);
            });
            matchList.forEach((match, index) => {
                embed.fields.push({
                    name: `Match #${index + 1}`,
                    value: moment(match.timestamp).format('MMMM Do YYYY, h:mma'),
                    inline: matchesToShow > 3
                });
                if ((index + 1) % 2 != 0
                    && matchesToShow > 3) {
                    embed.fields.push({ name: "\u200b", value: "\u200b", inline: true });
                }
            });

            loadingCMD.delete();
            await message.channel.createMessage({ embed: embed });
            await message.channel.createMessage("Enter the match number to select that match (i.e. \`1\`)");
            embed.fields = [];
            embed.description = "";

            const foundMatch = await getUserMatch(bot, matchList);
            if (foundMatch[0] == null) {
                embed.description = "Failed to read your message!";
                message.channel.createMessage({ embed: embed });
            } else if (foundMatch[0] == false) {
                embed.description = "Failed to get a valid match";
                embed.fields = [
                    {
                        name: "Error",
                        value: foundMatch[1] != {} && foundMatch[1] != undefined ? foundMatch[1] : "None"
                    }
                ];
                message.channel.createMessage({ embed: embed });
            } else if (foundMatch[0] == "cancel") {
                embed.description = "Cancelled";
                delete embed.thumbnail;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
            } else {
                const match = await getSingleMatch(bot, account, foundMatch[1].matchObj.gameId);

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

                let participentID;
                if (match.participantIdentities != undefined) {
                    participentID = match.participantIdentities.find(usr => usr.player.summonerId === summoner.id).participantId;
                }
                let participant;
                if (match.participants != undefined) {
                    participant = match.participants.find(usr => usr.participantId === participentID);
                }

                if (participant == undefined) {
                    embed.description = `I wasn't able to find **${account.name}** in that match`;
                    message.channel.createMessage({ embed: embed });
                    return;
                }

                const championName = Object.values(championsList)
                    .find(champ => parseInt(champ.key) == parseInt(participant.championId)).name;

                let gameDuration;
                if (match.gameDuration) {
                    let minutes = Math.floor((match.gameDuration / 60) % 60);
                    let hours = Math.floor((match.gameDuration / 3600) % 24);
                    if (hours < 1) {
                        gameDuration = `${minutes} minutes`;
                    } else {
                        gameDuration = `${hours} hours and ${minutes} minutes`;
                    }
                }

                embed.description = `Match Statistics for **${summoner.name}**`;
                embed.thumbnail = {
                    url:
                        `https://lolg-cdn.porofessor.gg/img/summonerIcons/10.22/64/${summoner.profileIconId}.png`
                        || message.author.avatarURL
                };
                embed.fields = [
                    { name: "Game Started", value: moment(match.gameCreation).fromNow(), inline: true },
                    { name: "Game Duration", value: gameDuration, inline: true },
                    // Add an empty field
                    { name: "\u200b", value: "\u200b", inline: true },

                    { name: "ID", value: match.gameId, inline: true },
                    { name: "Season", value: match.seasonId, inline: true },
                    { name: "Role", value: foundMatch[1].matchObj.role, inline: true },

                    { name: "Champion", value: championName, inline: true },
                    { name: "Win", value: participant.stats.win, inline: true },
                    { name: "Lane", value: participant.timeline.lane, inline: true },

                    { name: "Kills", value: participant.stats.kills, inline: true },
                    { name: "Deaths", value: participant.stats.deaths, inline: true },
                    { name: "Assists", value: participant.stats.assists, inline: true },

                    { name: "Healing Total", value: participant.stats.totalHeal.toLocaleString("en-US"), inline: true },
                    { name: "Damage Dealt", value: participant.stats.totalDamageDealt.toLocaleString("en-US"), inline: true },
                    { name: "Damage Taken", value: participant.stats.totalDamageTaken.toLocaleString("en-US"), inline: true },

                    { name: "Best Killing Spree", value: participant.stats.largestKillingSpree, inline: true },
                    { name: "Best Multi-kill", value: participant.stats.largestMultiKill, inline: true },
                    { name: "Killing Sprees", value: participant.stats.killingSprees, inline: true },

                    {
                        name: "Special Kills",
                        value:
                            `Double Kills: ${participant.stats.doubleKills}\n`
                            + `Triple Kills: ${participant.stats.tripleKills}\n`
                            + `Quadra Kills: ${participant.stats.quadraKills}\n`
                            + `Penta Kills: ${participant.stats.pentaKills}`
                    },
                ];
                message.channel.createMessage({ embed: embed });
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        async function getSummonerByName(bot, account) {
            let ratelimit = bot.util.cache.getCache("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gameLOL", `${account.region}${account.name.toLowerCase()}`, 0)) {
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
        async function getMatches(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameLOLM", `${account.region}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gameLOLM", `${account.region}${account.name.toLowerCase()}`, 0)) {
                let result = await superagent.get(
                    `https://${matchRegionsTo[account.region]}.api.riotgames.com` +
                    `/lol/match/v4/matchlists/by-account/${accountID}` +
                    `?api_key=${tokens.accounts.riot}`);
                return result.body
            } else {
                return ratelimit.matches;
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} gameID
        */
        async function getSingleMatch(bot, account, gameID) {
            let ratelimit = bot.util.cache.getCache("gameLOLM", gameID, 0);
            if (!bot.util.cache.checkLimit("gameLOLM", gameID, 0)) {
                let result = await superagent.get(
                    `https://${matchRegionsTo[account.region]}.api.riotgames.com` +
                    `/lol/match/v4/matches/${gameID}` +
                    `?api_key=${tokens.accounts.riot}`);
                return result.body
            } else {
                return ratelimit.match;
            }
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Array<Object>} matches
        */
        async function getUserMatch(bot, matches) {
            let matchFound = [null, null];

            while (matchFound[0] == null) {
                let temp = await bot.util.useful.awaitMessage(
                    message.channel,
                    // @ts-ignore
                    msg =>
                        msg.author.id === message.author.id
                        && msg.channel.id === message.channel.id,
                    60000
                ).catch(err => {
                    matchFound[0] = false;
                    matchFound[1] = err;
                });
                if (matchFound[0] == false) {
                    continue;
                }
                if (temp instanceof Eris.Message) {
                    temp.content = temp.content.toLowerCase();

                    if (temp.content === "cancel") {
                        matchFound[0] = "cancel";
                        continue;
                    }
                    if (temp.content.startsWith("#")) {
                        temp.content = temp.content.substring(1);
                    }

                    // @ts-ignore
                    if (isNaN(temp.content)) {
                        message.channel.createMessage(`${message.author.mention}, You didn't enter a match number`);
                        continue;
                    }
                    const matchNum = parseInt(temp.content);

                    if (matchNum <= 0 || matchNum > matches.length) {
                        message.channel.createMessage(`${message.author.mention}, That match number doesn't exist`);
                    } else {
                        if (matches[matchNum - 1] == undefined) {
                            message.channel.createMessage(`${message.author.mention}, That's not right. I couldn't find that match`);
                        } else {
                            matchFound[0] = true;
                            matchFound[1] = {
                                num: matchNum,
                                matchObj: matches[matchNum - 1]
                            }
                        }
                    }
                }
            }

            return matchFound;
        }
    }
}