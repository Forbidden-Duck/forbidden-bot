const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");
const moment = require("moment");
const tokens = require("../../../tokens.json");
const platforms = ["steam", "psn", "xbox"];
const weapons = {
    Item_Weapon_AK47_C: "AKM",
    Item_Weapon_Apple_C: "Apple",
    Item_Weapon_AUG_C: "AUG A3",
    Item_Weapon_AWM_C: "AWM",
    Item_Weapon_Berreta686_C: "S686",
    Item_Weapon_BerylM762_C: "Beryl",
    Item_Weapon_BizonPP19_C: "Bizon",
    Item_Weapon_Cowbar_C: "Crowbar",
    Item_Weapon_Crossbow_C: "Crossbow",
    Item_Weapon_DesertEagle_C: "Deagle",
    Item_Weapon_DP12_C: "DBS",
    Item_Weapon_DP28_C: "DP-28",
    Item_Weapon_FlareGun_C: "Flare Gun",
    Item_Weapon_FlashBang_C: "Flashbang",
    Item_Weapon_FNFal_C: "SLR",
    Item_Weapon_G18_C: "P18C",
    Item_Weapon_G36C_C: "G36C",
    Item_Weapon_Grenade_C: "Frag Grenade",
    Item_Weapon_Grenade_Warmode_C: "Frag Grenade",
    Item_Weapon_Groza_C: "Groza",
    Item_Weapon_HK416_C: "M416",
    Item_Weapon_Kar98k_C: "Kar98k",
    Item_Weapon_M16A4_C: "M16A4",
    Item_Weapon_M1911_C: "P1911",
    Item_Weapon_M249_C: "M249",
    Item_Weapon_M24_C: "M24",
    Item_Weapon_M9_C: "P92",
    Item_Weapon_Machete_C: "Machete",
    Item_Weapon_Mini14_C: "Mini 14",
    Item_Weapon_Mk14_C: "Mk14 EBR",
    Item_Weapon_Mk47Mutant_C: "Mk47 Mutant",
    Item_Weapon_Molotov_C: "Molotov Cocktail",
    Item_Weapon_Mosin_C: "Mosin-Nagant",
    Item_Weapon_MP5K_C: "MP5K",
    Item_Weapon_NagantM1895_C: "R1895",
    Item_Weapon_Pan_C: "Pan",
    Item_Weapon_PanzerFaust100M_C: "Panzerfaust",
    Item_Weapon_QBU88_C: "QBU88",
    Item_Weapon_QBZ95_C: "QBZ95",
    Item_Weapon_Rhino_C: "R45",
    Item_Weapon_Rock_C: "Rock",
    Item_Weapon_Saiga12_C: "S12K",
    Item_Weapon_Sawnoff_C: "Sawed-off",
    "Item_Weapon_SCAR-L_C": "SCAR-L",
    Item_Weapon_Sickle_C: "Sickle",
    Item_Weapon_SKS_C: "SKS",
    Item_Weapon_SmokeBomb_C: "Smoke Grenade",
    Item_Weapon_Snowball_C: "Snowball",
    Item_Weapon_SpikeTrap_C: "Spike Trap",
    Item_Weapon_StickyGrenade_C: "Sticky Bomb",
    Item_Weapon_Thompson_C: "Tommy Gun",
    Item_Weapon_UMP_C: "UMP9",
    Item_Weapon_UZI_C: "Micro Uzi",
    Item_Weapon_Vector_C: "Vector",
    Item_Weapon_VSS_C: "VSS",
    Item_Weapon_vz61Skorpion_C: "Skorpion",
    Item_Weapon_Win1894_C: "Win94",
    Item_Weapon_Winchester_C: "S1897"
};

module.exports = class Pubg extends Commando.Command {
    constructor(bot) {
        super(bot, "pubg", "pubg", {
            description: "Display pubg-specific statistics",
            usage: "pubg [Platform | User] [Name] [Weapon]"
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

            const platUsr = args[0];
            const nameArg = args[1];
            const nameArgLong = args.slice(1).join(" ");
            let wpnArg = args[2] || nameArg;
            if (args.length > 3) {
                wpnArg = args[args.length - 1];
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
                            `\`${prefix}pubg steam Forbidden_Duck\`\n` +
                            `\`${prefix}pubg me\``
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
            if (platUsr.toLowerCase() === "weapons"
                || (nameArg && nameArg.toLowerCase() === "weapons")) {
                let listedWeapons = [[], [], []];
                let rowIndex = 0;
                Object.values(weapons).forEach(weapon => {
                    listedWeapons[rowIndex].push(weapon.replace(/[ *]/gi, ""));
                    rowIndex++;
                    if (rowIndex > 2) {
                        rowIndex = 0;
                    }
                });

                embed.fields = [
                    { name: "Weapons", value: listedWeapons[0].join(", "), inline: true },
                    { name: "\u200b", value: listedWeapons[1].join(", "), inline: true },
                    { name: "\u200b", value: listedWeapons[2].join(", "), inline: true },
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
                if (linkedAccounts.pubg == undefined) {
                    embed.description = "You don't have an PUBG Account linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink pubg\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.pubg;
            } else if (platforms.includes(platUsr.toLowerCase())) {
                account.platform = platforms.find(plat => plat === platUsr.toLowerCase());
            } else {
                const parsedUser = bot.util.parse.userParse({
                    arg: platUsr,
                    mentions: message.mentions
                }, { id: true, name: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    const userLinked = (await bot.provider.find("users", { _id: parsedUser.id }, { limit: 1 }, true))[0]
                        .linkedAccounts.games || {};
                    if (userLinked.pubg == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked PUBG Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.pubg;
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
            } else {
                account.name = decodeURIComponent(account.name);
            }

            let viewType = "global";
            const viewTypeValue = {
                weapon: undefined
            };
            if (wpnArg && wpnArg.length > 0) {
                if (Object.values(weapons).find(wpn => wpn.toLowerCase() === wpnArg.toLowerCase())) {
                    viewType = "weapon";
                    viewTypeValue.weapon = Object.entries(weapons).find(wpn => wpn[1].toLowerCase() === wpnArg.toLowerCase());
                } else {
                    if (!platforms.includes(platUsr.toLowerCase())) {
                        embed.description = `**${wpnArg || platUsr}** is not a valid \`weapon\``;
                        embed.fields = [
                            {
                                name: "Tip",
                                value:
                                    `type \`${prefix}${this.name} weapons\` for all available weapons`
                            }
                        ];
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                }
            }
            if (platforms.includes(platUsr.toLowerCase())
                && args.length >= 3) {
                if (viewTypeValue.weapon == undefined) {
                    account.name = nameArgLong;
                } else {
                    account.name = nameArgLong.split(" ").slice(0, args.slice(1).length - 1).join(" ");
                }
            }
            account.name = encodeURIComponent(account.name);

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let profile;
            let stats;
            let weaponStats;
            try {
                profile = (await getProfileID(bot, account));
                stats = await getStats(bot, account, profile.id);
                weaponStats = await getWeaponStats(bot, account, profile.id);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "cannot read property 'data' of undefined":
                        embed.description =
                            "Is that a real person? I couldn't find anything about them. " +
                            "Please enter a valid name";
                        break;
                    case "cannot read property '0' of undefined":
                        embed.description =
                            "Is that a real person? I couldn't find anything about them. " +
                            "Please enter a valid name";
                        break;
                    case "cannot read property 'id' of undefined":
                        embed.description =
                            "Is that a real person? I couldn't find anything about them. " +
                            "Please enter a valid name";
                        break;
                    case "not found":
                        embed.description =
                            "Is that a real person? I couldn't find anything about them. " +
                            "Please enter a valid name";
                        break;
                    case "bad request":
                        embed.description =
                            "Is that a real person? I couldn't find anything about them. " +
                            "Please enter a valid name";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message || "None" });

                if (platUsr.toLowerCase() === "me") {
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $unset: { "linkedAccounts.games.pubg": "" }
                    }, true);
                    message.channel.createMessage({
                        content: "PUBG Account Unlinked",
                        embed: embed
                    });
                    return;
                }
                if (account.user != undefined
                    && account.user instanceof Eris.User) {
                    await bot.provider.update("users", { _id: account.user.id }, {
                        $unset: { "linkedAccounts.games.pubg": "" }
                    }, true);
                }
                message.channel.createMessage({ embed: embed });
                return;
            }

            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(
                `Loading Statistics for **${account.name}**` +
                `${viewType === "weapon"
                    ? ` on the weapon **${viewTypeValue.weapon[1]}**`
                    : ""}`
            );

            if (profile == undefined || stats == undefined || weaponStats == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Profile, Stats or Weapon Stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    profile: profile,
                    stats: stats,
                    weapons: weaponStats
                });
            }

            loadingCMD.delete();
            switch (viewType) {
                case "global": {
                    embed.thumbnail = {
                        url: "https://i.dlpng.com/static/png/6833220_preview.png"
                    };
                    embed.description =
                        `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} [Weapon]\` for Weapon Stats\n\n` +
                        `**${profile.attributes.name}** has eliminated themselves **${allAttri(stats, "suicides")}** times`;
                    embed.fields = [
                        { name: "Name", value: profile.attributes.name, inline: true },
                        { name: "Platform", value: profile.attributes.shardId, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Headshots", value: allAttri(stats, "headshotKills"), inline: true },
                        {
                            name: "Headshots Percentage",
                            value: `${(allAttri(stats, "headshotKills") || 0 / allAttri(stats, "kills") || 0 * 100).toFixed(0)}%`,
                            inline: true
                        },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Kills", value: allAttri(stats, "kills"), inline: true },
                        { name: "Assists", value: allAttri(stats, "assists"), inline: true },
                        { name: "Longest Kill", value: `${largeAttri(stats, "longestKill").toFixed(0)}m`, inline: true },

                        { name: "Wins", value: allAttri(stats, "wins"), inline: true },
                        { name: "Losses", value: allAttri(stats, "losses"), inline: true },
                        { name: "Win/Lose Ratio", value: (allAttri(stats, "wins") / allAttri(stats, "losses")).toFixed(2), inline: true },

                        { name: "Longest Time Survived", value: `${(largeAttri(stats, "longestTimeSurvived") / 60).toFixed(0)} minutes`, inline: true },
                        { name: "Total Time Survived", value: `${(allAttri(stats, "timeSurvived") / 3600).toFixed(0)} hours`, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Total Walk Distance", value: `${(allAttri(stats, "walkDistance") / 1000).toFixed(2)}km`, inline: true },
                        { name: "Total Ride Distance", value: `${(allAttri(stats, "rideDistance") / 1000).toFixed(2)}km`, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                case "weapon": {
                    let weapon;
                    if (weaponStats.attributes.weaponSummaries[viewTypeValue.weapon[0]] != undefined) {
                        weapon = weaponStats.attributes.weaponSummaries[viewTypeValue.weapon[0]].StatsTotal;
                    }
                    if (weapon == undefined) {
                        embed.description = `I failed to find **${viewTypeValue.weapon[1]}**\nHave they used it before?`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    embed.thumbnail = {
                        url: "https://i.dlpng.com/static/png/6833220_preview.png"
                    };
                    embed.description =
                        `type \`${prefix}${this.name} weapons\` for all weapons`;
                    embed.fields = [
                        { name: "Name", value: profile.attributes.name, inline: true },
                        { name: "Platform", value: profile.attributes.shardId, inline: true },
                        { name: "Weapon", value: viewTypeValue.weapon[1], inline: true },

                        { name: "Kills", value: weapon.Kills, inline: true },
                        { name: "Downed", value: weapon.Defeats, inline: true },
                        { name: "Damage", value: weapon.DamagePlayer.toFixed(0), inline: true },

                        { name: "Headshots", value: weapon.HeadShots, inline: true },
                        { name: "Stuns", value: weapon.Groggies, inline: true },
                        { name: "Longest Down", value: `${weapon.LongestDefeat.toFixed(2)}m`, inline: true },

                        { name: "Most Kills", value: weapon.MostKillsInAGame, inline: true },
                        { name: "Most Downed", value: weapon.MostDefeatsInAGame, inline: true },
                        { name: "Most Damage", value: weapon.MostDamagePlayerInAGame.toFixed(0), inline: true },

                        { name: "Most Headshots", value: weapon.MostHeadShotsInAGame, inline: true },
                        { name: "Most Stuns", value: weapon.MostGroggiesInAGame, inline: true },
                        { name: "Long-ranged Downs", value: weapon.LongRangeDefeats, inline: true },
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
        async function getProfileID(bot, account) {
            let ratelimit = bot.util.cache.getCache("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                let result = await superagent.get(`https://api.pubg.com/shards/${account.platform}/players?filter[playerNames]=${account.name}`)
                    .set("Authorization", `Bearer ${tokens.games.pubg}`)
                    .set("Accept", "application/vnd.api+json");
                return result.body.data[0];
            } else {
                return ratelimit.profile;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        async function getStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                let result = await superagent.get(`https://api.pubg.com/shards/${account.platform}/players/${accountID}/seasons/lifetime`)
                    .set("Authorization", `Bearer ${tokens.games.pubg}`)
                    .set("Accept", "application/vnd.api+json");
                return result.body.data;
            } else {
                return ratelimit.stats;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
        */
        async function getWeaponStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0);
            if (!bot.util.cache.checkLimit("gamePUBG", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                let result = await superagent.get(`https://api.pubg.com/shards/${account.platform}/players/${accountID}/weapon_mastery`)
                    .set("Authorization", `Bearer ${tokens.games.pubg}`)
                    .set("Accept", "application/vnd.api+json");
                return result.body.data;
            } else {
                return ratelimit.weapons;
            }
        }

        function allAttri(stats, attribute) {
            const gamemodes = Object.values(stats.attributes.gameModeStats);

            let total = 0;
            gamemodes.forEach(mode => {
                if (mode[attribute] != undefined) {
                    total = total + parseInt(mode[attribute]);
                }
            });
            return total;
        }

        function largeAttri(stats, attribute) {
            const gamemodes = Object.values(stats.attributes.gameModeStats);

            let attributes = [];
            gamemodes.forEach(mode => {
                if (mode[attribute] != undefined) {
                    attributes.push(parseInt(mode[attribute]));
                }
            });
            return attributes.sort((a, b) => b - a)[0];
        }
    }
}