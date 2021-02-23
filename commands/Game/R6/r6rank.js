const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");
const tokens = require("../../../tokens.json");
const r6API = require("r6api.js");
// @ts-ignore
const r6 = new r6API(tokens.accounts.ubisoft.username, tokens.accounts.ubisoft.password);
const seasonsNoUser = {
    '6': {
        id: 6,
        name: 'Health',
        color: '#0050b3',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2w0kuPWW4vZS2MvHxpjgKL/527a78f482f03250f48ee05fabb843a9/r6s-seasons-y2s2.jpg',
    },
    '7': {
        id: 7,
        name: 'Blood Orchid',
        color: '#ca361c',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5Is8lRiLLAaU0Uaj46Bu5Z/d46a8652cdf16426b7c9a0d634442be5/r6s-seasons-y2s3.jpg',
    },
    '8': {
        id: 8,
        name: 'White Noise',
        color: '#006543',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6FvQKw65QzOqhVKxbjBg1Z/70ea9eb8865182504f74cfea10f88c0a/r6s-seasons-y2s4.jpg',
    },
    '9': {
        id: 9,
        name: 'Chimera',
        color: '#ffc113',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/35ZyIYUW7odr1tiGyGNd8R/8a578688e5c46ed779a382c940bf270b/rainbow6siege-chimera-thumb_318068.jpg',
    },
    '10': {
        id: 10,
        name: 'Para Bellum',
        color: '#949f39',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/522ZBrBzlJMoTi63hrwuna/3f9007ceaa80b8110fa282937309ac1e/rainbow6siege_parabellum_thumb_323480.jpg',
    },
    '11': {
        id: 11,
        name: 'Grim Sky',
        color: '#81a0c1',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4y07zikRXB4BcyRQy5Anoe/2e6de56c3ea34cadb300326102963340/rainbow6siege_grimsky_thumb_333789.jpg',
    },
    '12': {
        id: 12,
        name: 'Wind Bastion',
        color: '#aa854f',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1VeuGBLdSsadK5MdLfCL9k/b9e213c4aeb8dfe6e1f137968770912a/rainbow6siege_windbastion_thumb_340468.jpg',
    },
    '13': {
        id: 13,
        name: 'Burnt Horizon',
        color: '#d2005a',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4J2E0yJ2cZsKgx5OrFGkvR/0f966f31b3d8ad2ef13926b075769334/r6s-seasons-y4s1.jpg',
    },
    '14': {
        id: 14,
        name: 'Phantom Sight',
        color: '#304395',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29ze1Zxf173boRuyaFHuQV/c240df821c3ec407b09118c68a1300c0/r6s-seasons-y4s2.jpg',
    },
    '15': {
        id: 15,
        name: 'Ember Rise',
        color: '#156309',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1JeHAGdUglVNSUUvSkxSia/1c8b76a4256091ca40434e89addaacf2/r6s-seasons-y4s3.jpg',
    },
    '16': {
        id: 16,
        name: 'Shifting Tides',
        color: '#089eb3',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6uZSbKGZiwF7Zv5egr4zks/5597030f075ad99c0a18a1dcea34ef87/r6s-seasons-y4s4.jpg',
    },
    '17': {
        id: 17,
        name: 'Void Edge',
        color: '#946a97',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2584xuwMoCH1FJc9n34jLo/9dfec73fd217a889a7bfe66e1f412cd6/r6s-seasons-y5s1.jpg',
    },
    '18': {
        id: 18,
        name: 'Steel Wave',
        color: '#2b7f9b',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4soZ80QzL9WoLqvq8Hz647/d8d70312ec2849c276b459c3ef0482cd/r6s-seasons-y5s2.jpg',
    },
    '19': {
        id: 19,
        name: 'Shadow Legacy',
        color: '#6ca511',
        image: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5H87SAzADrzRmroVnJzuUE/2e73c489074b538055df0f793b4e1639/r6s-seasons-y5s3.jpg',
    }
}
const rankEmotes = [
    "<:R6Unranked:792304698601766923>",
    "<:R6CopperI:792304700333490176>",
    "<:R6CopperII:792304698799161375>",
    "<:R6CopperIII:792304698438451201>",
    "<:R6CopperIV:792304698400964619>",
    "<:R6CopperV:792304698375929859>",
    "<:R6BronzeI:792304691698335744>",
    "<:R6BronzeII:792304692117635092>",
    "<:R6BronzeIII:792304692440334336>",
    "<:R6BronzeIV:792304692951646248>",
    "<:R6BronzeV:792304695448174592>",
    "<:R6SilverI:792304702841946123>",
    "<:R6SilverII:792304702385160222>",
    "<:R6SilverIII:792304702489886750>",
    "<:R6SilverIV:792304702482153472>",
    "<:R6SilverV:792304702301405195>",
    "<:R6GoldI:792304703945048074>",
    "<:R6GoldII:792304702640488459>",
    "<:R6GoldIII:792304702380441602>",
    "<:R6GoldIV:792304703399657472>",
    "<:R6PlatinumI:792304704663191553>",
    "<:R6PlatinumII:792304704507871243>",
    "<:R6PlatinumIII:792304705098743818>",
    "<:R6Diamond:792304704708411403>",
    "<:R6Champions:792304705954512917>",
];

module.exports = class Ping extends Commando.Command {
    constructor(bot) {
        super(bot, "r6rank", "r6", {
            description: "Display r6siege-specific season rank statistics",
            usage: "r6rank [Name | User] [Season]"
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

            let embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                thumbnail: {
                    url: "https://i.imgur.com/bdHoYXi.png"
                },
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const nameUsr = args[0];
            const seasonArg = args[1];

            if (nameUsr == undefined || nameUsr.length <= 0) {
                embed.description = "You need to enter a \`name\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tips",
                        value:
                            `type \`${prefix}${this.name} seasons\` for all available seasons`
                    },
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr && nameUsr.toLowerCase() === "seasons") {
                const seasons = Object.values(seasonsNoUser);
                for (const season of seasons) {
                    embed.fields.push(
                        {
                            name: season.name,
                            value:
                                `**Season ID**: ${season.id}\n` +
                                `**Season Name**: ${season.name}`,
                            inline: true
                        }
                    )
                }
                embed.description =
                    `Maybe inaccurate, enter a user \`${prefix}r6rank Forbidden_Duck seasons\`\n` +
                    `Use **Season ID** \`${prefix}r6rank Forbidden_Duck 19\``;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const linkedAccounts = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0]
                .linkedAccounts.games || {};
            let account = {
                name: undefined
            }

            if (nameUsr.toLowerCase() === "me") {
                if (linkedAccounts.r6siege == undefined) {
                    embed.description = "You don't have a R6 Siege Account Linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink r6\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.r6siege;
            } else {
                const parsedUser = bot.util.parse.userParse({
                    arg: nameUsr,
                    mentions: message.mentions
                }, { id: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    const userLinked = (await bot.provider.find("users", { _id: parsedUser.id }, { limit: 1 }, true))[0]
                        .linkedAccounts.games || {};
                    if (userLinked.r6siege == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked R6 Siege Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.r6siege;
                    account.user = parsedUser;
                } else {
                    account.name = nameUsr;
                }
            }

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let accountID;
            let ranks;
            try {
                accountID = await getProfileID(bot, account);
                ranks = await getRanks(bot, account, accountID);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "cannot read property 'userId' of undefined":
                        embed.description = "Do I know you? I don't think I do. Please enter a valid username";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message || "None" });

                if (nameUsr.toLowerCase() === "me") {
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $unset: { "linkedAccounts.games.r6siege": "" }
                    }, true);
                    message.channel.createMessage({
                        content: "R6 Siege Account Unlinked",
                        embed: embed
                    });
                    return;
                }
                if (account.user != undefined
                    && account.user instanceof Eris.User) {
                    await bot.provider.update("users", { _id: account.user.id }, {
                        $unset: { "linkedAccounts.games.r6siege": "" }
                    }, true);
                }
                message.channel.createMessage({ embed: embed });
                return;
            }
            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(`Loading Statistics for **${account.name}**`);

            if (ranks == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your ranks";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameR6R", account.name.toLowerCase(), 0)) {
                bot.util.cache.addCache("gameR6R", account.name.toLowerCase(), 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    account_id: accountID,
                    ranks: ranks
                });
            }

            if ((seasonArg && seasonArg === "seasons")
                || !seasonArg) {
                const seasons = Object.values(ranks.seasons);
                for (const season of seasons) {
                    embed.fields.push(
                        {
                            name: season.name,
                            value:
                                `**Season ID**: ${season.id}\n` +
                                `**Season Name**: ${season.name}`,
                            inline: true
                        }
                    )
                }
                embed.description = `Use **Season ID** \`${prefix}r6rank Forbidden_Duck 19\``;

                if (!seasonArg) {
                    embed.description =
                        `You need to enter a season to search for\n` +
                        `Use **Season ID** \`${prefix}r6rank Forbidden_Duck 19\``;
                }
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (ranks.seasons[seasonArg] == undefined) {
                embed.description = `The season \`${seasonArg}\` does not exist for **${account.name}**`;
            }

            embed.fields = [
                { name: "Username", value: account.name, inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Season", value: ranks.seasons[seasonArg].name, inline: true },
            ];

            let americas = ranks.seasons[seasonArg].regions.ncsa || undefined;
            let europe = ranks.seasons[seasonArg].regions.emea || undefined;
            let oceania = ranks.seasons[seasonArg].regions.apac || undefined;
            embed = appendRegion(embed, americas);
            embed = appendRegion(embed, europe);
            embed = appendRegion(embed, oceania);
            if (embed.fields.length == 3) {
                embed.fields = [];
                delete embed.thumbnail;
                embed.description = `**${account.name}** has not played the season **${ranks.seasons[seasonArg].name}**`;
            } else {
                embed.color = parseInt(ranks.seasons[seasonArg].color.replace("#", "0x"));
                embed.thumbnail = {
                    url: ranks.seasons[seasonArg].image
                }
            }
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }

        function appendRegion(embed, region) {
            if (region.updateTime.startsWith("1970")
                || region.nextMmr == 0) {
                return embed;
            }
            region.name = region.region === "ncsa" ? "America" : region.region === "emea" ? "Europe" : "Asia/Pacific";

            const currentRank = region.current.name;
            const currentEmote = rankEmotes
                .find(item => item.split(":")[1]
                    === `R6${currentRank.split(" ")[0]}${currentRank.split(" ")[1]
                        ? numberToNumero(parseInt(currentRank.split(" ")[1]))
                        : ""}`);
            const maxRank = region.max.name;
            const maxEmote = rankEmotes
                .find(item => item.split(":")[1]
                    === `R6${maxRank.split(" ")[0]}${maxRank.split(" ")[1]
                        ? numberToNumero(parseInt(maxRank.split(" ")[1]))
                        : ""}`);

            embed.fields.push(
                { name: "Region", value: region.name },

                { name: "MMR", value: `${region.current.mmr} / ${region.nextMmr}`, inline: true },
                { name: "Current", value: `${currentEmote} ${currentRank}`, inline: true },
                { name: "Peak", value: `${maxEmote} ${maxRank} (${region.max.mmr})`, inline: true },

                { name: "Wins", value: region.wins, inline: true },
                { name: "Losses", value: region.losses, inline: true },
                { name: "Abandons", value: region.abandons, inline: true },

                { name: "Kills", value: region.kills, inline: true },
                { name: "Deaths", value: region.deaths, inline: true },
                { name: "Kill / Death Ratio", value: `${(region.kills / region.deaths).toFixed(2)}`, inline: true },
            );
            return embed;
        }

        function numberToNumero(num) {
            if (num <= 3) {
                let output = "";
                for (let i = 0; i < num; i++) {
                    output += "I";
                }
                return output;
            } else {
                switch (num) {
                    case 4:
                        return "IV";
                    case 5:
                        return "V";
                }
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        async function getProfileID(bot, account) {
            let ratelimit = bot.util.cache.getCache("gameR6R", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6R", account.name.toLowerCase(), 0)) {
                return await r6.getId("uplay", account.name).then(el => el[0].userId);
            } else {
                return ratelimit.account_id;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} accountID
        */
        async function getRanks(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameR6R", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6R", account.name.toLowerCase(), 0)) {
                return await r6.getRank("uplay", accountID, { seasons: "all" }).then(el => el[0]);
            } else {
                return ratelimit.ranks;
            }
        }
    }
}