const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");
const moment = require("moment");
const tokens = require("../../../tokens.json");
const maps = {
    baggage: {
        name: "Baggage",
        id: "baggage"
    },
    monastery: {
        name: "Monastery",
        id: "monastery"
    },
    shoots: {
        name: "Shoots",
        id: "shoots"
    },
    assault: {
        name: "Assault",
        id: "assault"
    },
    italy: {
        name: "Italy",
        id: "italy"
    },
    militia: {
        name: "Militia",
        id: "militia"
    },
    office: {
        name: "Office",
        id: "office"
    },
    aztec: {
        name: "Aztec",
        id: "aztec"
    },
    bank: {
        name: "Bank",
        id: "bank"
    },
    cbble: {
        name: "Cobblestone",
        id: "cbble"
    },
    dust: {
        name: "Dust",
        id: "dust"
    },
    dust2: {
        name: "Dust II",
        id: "dust2"
    },
    inferno: {
        name: "Inferno",
        id: "inferno"
    },
    lake: {
        name: "Lake",
        id: "lake"
    },
    nuke: {
        name: "Nuke",
        id: "nuke"
    },
    piranesi: {
        name: "Piranesi",
        id: "piranesi"
    },
    safehouse: {
        name: "Safehouse",
        id: "safehouse"
    },
    shorttrain: {
        name: "Shorttrain",
        id: "shorttrain"
    },
    stmarc: {
        name: "St. Marc",
        id: "stmarc"
    },
    sugarcane: {
        name: "Sugarcane",
        id: "sugercane"
    },
    train: {
        name: "Train",
        id: "train"
    },
    vertigo: {
        name: "Vertigo",
        id: "vertigo"
    },
    mirage: {
        name: "Mirage",
        id: "mirage"
    }
};
const weapons = {
    rifle: {
        ak47: {
            name: "AK-47",
            id: "ak47"
        },
        aug: {
            name: "AUG",
            id: "aug"
        },
        awp: {
            name: "AWP",
            id: "awp"
        },
        famas: {
            name: "FAMAS",
            id: "famas"
        },
        g3sg1: {
            name: "G3SG1",
            id: "g3sg1"
        },
        galilar: {
            name: "Galil AR",
            id: "galilar"
        },
        m4a1: {
            name: "M4A4",
            id: "m4a1"
        },
        scar20: {
            name: "SCAR-20",
            id: "scar20"
        },
        sg556: {
            name: "SG 553",
            id: "sg556"
        },
        ssg08: {
            name: "SSG 08",
            id: "ssg08"
        }
    },
    smg: {
        bizon: {
            name: "PP-Bizon",
            id: "bizon"
        },
        mac10: {
            name: "MAC-10",
            id: "mac10"
        },
        mp7: {
            name: "MP7",
            id: "mp7"
        },
        mp9: {
            name: "MP9",
            id: "mp9"
        },
        p90: {
            name: "P90",
            id: "p90"
        },
        ump45: {
            name: "UMP-45",
            id: "ump45"
        }
    },
    pistol: {
        deagle: {
            name: "Desert Eagle",
            id: "deagle"
        },
        elite: {
            name: "Dual Berettas",
            id: "elite"
        },
        fiveseven: {
            name: "Five-SeveN",
            id: "fiveseven"
        },
        glock: {
            name: "Glock-18",
            id: "glock"
        },
        hkp2000: {
            name: "P2000",
            id: "hkp2000"
        },
        p250: {
            name: "P250",
            id: "p250"
        },
        tec9: {
            name: "Tec-9",
            id: "tec9"
        }
    },
    heavy: {
        m249: {
            name: "M249",
            id: "m249"
        },
        mag7: {
            name: "MAG-7",
            id: "mag7"
        },
        negev: {
            name: "Negev",
            id: "negev"
        },
        nova: {
            name: "Nova",
            id: "nova"
        },
        sawedoff: {
            name: "Sawed-Off",
            id: "sawedoff"
        },
        xm1014: {
            name: "XM1014",
            id: "xm1014"
        }
    },
    gear: {
        taser: {
            name: "Zeus x27",
            id: "taser"
        }
    }
};

module.exports = class CSGO extends Commando.Command {
    constructor(bot) {
        super(bot, "csgo", "csgo", {
            description: "Display csgo-specific statistics",
            usage: "csgo [Name | User] [Map | Weapon]",
            aliases: ["cs"]
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

            const nameUsr = args[0];
            const mapWpn = args[1];

            if (nameUsr == undefined || nameUsr.length <= 0) {
                embed.description = "You need to enter a \`name\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tips",
                        value:
                            `type \`${prefix}${this.name} maps\` for all available maps\n` +
                            `type \`${prefix}${this.name} weapons\` for all available weapons`
                    },
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr.toLowerCase() === "maps"
                || (mapWpn && mapWpn.toLowerCase() === "maps")) {
                embed.description = "Make sure to use **ID** when search for maps";
                Object.values(maps).forEach(map => {
                    embed.fields.push({ name: map.name, value: `**ID**: ${map.id}`, inline: true });
                });
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr.toLowerCase() === "weapons"
                || (mapWpn && mapWpn.toLowerCase() === "weapons")) {
                embed.description = "Make sure to use the **ID** when searching for weapons";
                // Rifles
                embed.fields.push({
                    name: `Rifles`,
                    value: Object.values(weapons.rifle).map(wpn =>
                        `**Name**: ${wpn.name} **ID**: ${wpn.id}`).join("\n"),
                    inline: true
                });
                // SMG
                embed.fields.push({
                    name: `SMG`,
                    value: Object.values(weapons.smg).map(wpn =>
                        `**Name**: ${wpn.name} **ID**: ${wpn.id}`).join("\n"),
                    inline: true
                });
                // Heavy
                embed.fields.push({
                    name: `Heavy`,
                    value: Object.values(weapons.heavy).map(wpn =>
                        `**Name**: ${wpn.name} **ID**: ${wpn.id}`).join("\n"),
                    inline: true
                });
                // Pistol
                embed.fields.push({
                    name: `Pistol`,
                    value: Object.values(weapons.pistol).map(wpn =>
                        `**Name**: ${wpn.name} **ID**: ${wpn.id}`).join("\n"),
                    inline: true
                });
                // Gear
                embed.fields.push({
                    name: `Gear`,
                    value: Object.values(weapons.gear).map(wpn =>
                        `**Name**: ${wpn.name} **ID**: ${wpn.id}`).join("\n"),
                    inline: true
                });
                message.channel.createMessage({ embed: embed });
                return;
            }

            const linkedAccounts = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0]
                .linkedAccounts.games || {};
            let account = {
                name: undefined
            }

            if (nameUsr.toLowerCase() === "me") {
                if (linkedAccounts.csgo == undefined) {
                    embed.description = "You don't have a CSGO Account Linked";
                    embed.fields = [
                        { name: "How to link", value: `type \`${prefix}gamelink cs\`` }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
                account = linkedAccounts.csgo;
            } else {
                const parsedUser = bot.util.parse.userParse({
                    arg: nameUsr,
                    mentions: message.mentions
                }, { id: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    const userLinked = (await bot.provider.find("users", { _id: parsedUser.id }, { limit: 1 }, true))[0]
                        .linkedAccounts.games || {};
                    if (userLinked.csgo == undefined) {
                        embed.description =
                            `**${bot.util.useful.getUserTag(parsedUser)}** doesn't have a linked CSGO Account`;
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    embed.author = {
                        name: parsedUser.username,
                        icon_url: parsedUser.avatarURL
                    }
                    account = userLinked.csgo;
                    account.user = parsedUser;
                } else {
                    account.name = nameUsr;
                }
            }

            let viewType = "global";
            const viewTypeValue = {
                map: undefined,
                weapon: undefined
            };
            if (mapWpn && mapWpn.length > 0) {
                if (Object.values(maps).find(map => map.id === mapWpn.toLowerCase())) {
                    viewType = "map";
                    viewTypeValue.map = Object.values(maps).find(map => map.id === mapWpn.toLowerCase());
                } else {
                    if (Object.entries(weapons).find(type => Object.keys(type[1]).includes(mapWpn.toLowerCase()))) {
                        viewType = "weapon";
                        viewTypeValue.weapon = {
                            type: Object.entries(weapons).find(type => Object.keys(type[1]).includes(mapWpn.toLowerCase()))[0]
                        };
                        viewTypeValue.weapon.weapon =
                            Object.values(weapons[viewTypeValue.weapon.type]).find(wpn => wpn.id === mapWpn.toLowerCase());
                    } else {
                        embed.description = `**${mapWpn}** is not a valid \`map\` or \`weapon\``;
                        embed.fields = [
                            {
                                name: "Tips",
                                value:
                                    `type \`${prefix}${this.name} maps\` for all available maps\n` +
                                    `type \`${prefix}${this.name} weapons\` for all available weapons`
                            }
                        ];
                        delete embed.timestamp;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                }
            }
            if (account.name.startsWith("<") && account.name.endsWith(">")) {
                account.name = account.name.substring(1, account.name.length - 1);
            }
            account.name = encodeURIComponent(account.name);

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let accountID;
            let stats;
            let mapApi;
            let weaponApi;
            try {
                accountID = (await getProfileID(bot, account))[0].platformUserId;
                stats = await getStats(bot, account, accountID);
                mapApi = await getMaps(bot, account, accountID);
                weaponApi = await getWeapons(bot, account, accountID);
            } catch (err) {
                validatingCMD.delete();
                switch (err.message.toLowerCase()) {
                    case "cannot read property 'platformuserid' of undefined":
                        embed.description = "Oh look, nothing. Please input a legitimate CommunityURL or Vanity Username";
                        break;
                    case "internal server error":
                        embed.description = "Oh look, nothing. Please input a legitimate CommunityURL or Vanity Username";
                        break;
                    case "unavailable for legal reasons":
                        embed.description =
                            "**This profile appears to be in James Bond mode.**\n" +
                            "To reverse this, change the profile privacy settings to public\n" +
                            "Please wait about **10 minutes** for the stats to refresh"
                        break;
                    case "service unavailable":
                        embed.description =
                            "We use <https://tracker.gg/csgo> for your CSGO Stats\n" +
                            "It appears their service is unavailable right now. Try again later!";
                        break;
                    default:
                        embed.description = "Unexpected error occured";
                        break;
                }
                embed.fields.push({ name: "Error", value: err.message || "None" });

                if (err.message.toLowerCase() !== "service unavailable") {
                    if (nameUsr.toLowerCase() === "me") {
                        await bot.provider.update("users", { _id: message.author.id }, {
                            $unset: { "linkedAccounts.games.csgo": "" }
                        }, true);
                        message.channel.createMessage({
                            content: "CSGO Account Unlinked",
                            embed: embed
                        });
                        return;
                    }
                    if (account.user != undefined
                        && account.user instanceof Eris.User) {
                        await bot.provider.update("users", { _id: account.user.id }, {
                            $unset: { "linkedAccounts.games.csgo": "" }
                        }, true);
                    }
                }
                message.channel.createMessage({ embed: embed });
                return;
            }

            validatingCMD.delete();
            const loadingCMD = await message.channel.createMessage(
                `Loading Statistics for **${account.name}**` +
                `${viewType === "map"
                    ? ` on the map **${viewTypeValue.map.name}**`
                    : viewType === "weapon"
                        ? ` on the weapon **${viewTypeValue.weapon.weapon.name}**`
                        : ""}`
            );

            if (stats == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Profile or Stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (viewType !== "global" && (mapApi == undefined && weaponApi == undefined)) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Maps or Weapons";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameCSGO", account.name.toLowerCase(), 0)) {
                bot.util.cache.addCache("gameCSGO", account.name.toLowerCase(), 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    account_id: accountID,
                    stats: stats,
                    maps: mapApi,
                    weapons: weaponApi
                });
            }

            /** Stats Formatting */
            const platformInfo = stats.platformInfo;
            const userInfo = stats.userInfo;
            const segmentStats = stats.segments[0].stats;
            const segementValues = {
                timePlayed: segmentStats.timePlayed.displayValue,
                score: segmentStats.score.displayValue,
                damage: segmentStats.damage.displayValue,
                headshots: segmentStats.headshots.displayValue,
                headshotPct: segmentStats.headshotPct.displayValue,
                kills: segmentStats.kills.displayValue,
                deaths: segmentStats.deaths.displayValue,
                kd: segmentStats.kd.displayValue,
                shotsFired: segmentStats.shotsFired.displayValue,
                shotsHit: segmentStats.shotsHit.displayValue,
                shotsAccuracy: segmentStats.shotsAccuracy.displayValue,
                bombsPlanted: segmentStats.bombsPlanted.displayValue,
                bombsDefused: segmentStats.bombsDefused.displayValue,
                hostagesRescued: segmentStats.hostagesRescued.displayValue,
                wins: segmentStats.wins.displayValue,
                losses: segmentStats.losses.displayValue,
                wlPercentage: segmentStats.wlPercentage.displayValue,
                roundsPlayed: segmentStats.roundsPlayed.displayValue,
                roundsWon: segmentStats.roundsWon.displayValue,
                mvp: segmentStats.mvp.displayValue
            };


            if (bot.util.rolecheck.checkDonor(message.author, "is$5")
                || bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                segementValues.kills = percentile("kills", segmentStats)
                segementValues.deaths = percentile("deaths", segmentStats)
                segementValues.kd = percentile("kd", segmentStats)
                segementValues.shotsFired = percentile("shotsFired", segmentStats)
                segementValues.shotsHit = percentile("shotsHit", segmentStats)
                segementValues.shotsAccuracy = percentile("shotsAccuracy", segmentStats)
            }

            loadingCMD.delete();
            switch (viewType) {
                case "global":
                    embed.title = "Global Statistics";
                    embed.description =
                        `type \`${prefix}${this.name} ${nameUsr} [Map]\` to view a maps statistics\n` +
                        `type \`${prefix}${this.name} ${nameUsr} [Weapon]\` to view a weapons statistics`;
                    embed.fields = [
                        { name: "Username", value: platformInfo.platformUserHandle, inline: true },
                        { name: "Country Code", value: userInfo.countryCode || "N/A", inline: true },
                        { name: "Time Played", value: segementValues.timePlayed, inline: true },

                        { name: "Kills", value: segementValues.kills, inline: true },
                        { name: "Deaths", value: segementValues.deaths, inline: true },
                        { name: "Kill/Death Ratio", value: segementValues.kd, inline: true },

                        { name: "Shots Fired", value: segementValues.shotsFired, inline: true },
                        { name: "Shots Hit", value: segementValues.shotsHit, inline: true },
                        { name: "Shots Accuracy", value: segementValues.shotsAccuracy, inline: true },

                        { name: "Bombs Planted", value: segementValues.bombsPlanted, inline: true },
                        { name: "Bombs Defused", value: segementValues.bombsDefused, inline: true },
                        { name: "Hostages Rescued", value: segementValues.hostagesRescued, inline: true },

                        { name: "Wins", value: segementValues.wins, inline: true },
                        { name: "Losses", value: segementValues.losses, inline: true },
                        { name: "Win/Lose Ratio", value: segementValues.wlPercentage, inline: true },

                        { name: "Rounds Played", value: segementValues.roundsPlayed, inline: true },
                        { name: "Rounds Won", value: segementValues.roundsWon, inline: true },
                        { name: "MVPs", value: segementValues.mvp, inline: true },

                        { name: "Score", value: segementValues.score, inline: true },
                        { name: "Damage", value: segementValues.damage, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Headshots", value: segementValues.headshots, inline: true },
                        { name: "Headshot Percentage", value: segementValues.headshotPct, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true }
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                case "map":
                    /** Maps Formatting */
                    const map = mapApi.find(map => map.metadata.name === viewTypeValue.map.name);
                    if (!map) {
                        embed.description = `I failed to find **${viewTypeValue.map.name}**\nHave they played it before?`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    const mapMeta = map.metadata;
                    const mapAttri = map.attributes;
                    const mapStats = map.stats;
                    const mapValues = {
                        rounds: mapStats.rounds.displayValue,
                        wins: mapStats.wins.displayValue,
                        wlPercentage: (mapStats.wins.value / map.stats.rounds.value * 100).toFixed(0)
                    }

                    embed.title = `${mapMeta.name} Statistics`;
                    embed.image = { url: mapMeta.imageUrl };
                    embed.description =
                        `type \`${prefix}${this.name} maps\` to view all maps\n`;
                    embed.fields = [
                        { name: "Name", value: mapMeta.name, inline: true },
                        { name: "ID", value: mapAttri.key, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Rounds", value: mapValues.rounds, inline: true },
                        { name: "Wins", value: mapValues.wins, inline: true },
                        { name: "Win Percentage", value: `${mapValues.wlPercentage}%`, inline: true },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                case "weapon":
                    /** Weapons Formatting */
                    const weapon = weaponApi.find(wpn => wpn.metadata.name === viewTypeValue.weapon.weapon.name);
                    if (!weapon) {
                        embed.description = `I failed to find **${viewTypeValue.weapon.weapon.name}**\nHave they used it before?`;
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                    const weaponMeta = weapon.metadata;
                    const weaponAttri = weapon.attributes;
                    const weaponStats = weapon.stats;
                    const weaponValues = {
                        type: weaponMeta.category.displayValue,
                        shotsFired: weaponStats.shotsFired.displayValue,
                        shotsHit: weaponStats.shotsHit.displayValue,
                        shotsAccuracy: weaponStats.shotsAccuracy.value.toFixed(0),
                        kills: weaponStats.kills.displayValue
                    }

                    embed.title = `${weaponMeta.name} Statistics`;
                    embed.thumbnail = { url: weaponMeta.imageUrl };
                    embed.description =
                        `type \`${prefix}${this.name} weapons\` to view all weapons\n`;
                    embed.fields = [
                        { name: "Name", value: weaponMeta.name, inline: true },
                        { name: "ID", value: weaponAttri.key, inline: true },
                        { name: "Type", value: weaponValues.type, inline: true },

                        { name: "Shots Fired", value: weaponValues.shotsFired, inline: true },
                        { name: "Shots Hit", value: weaponValues.shotsHit, inline: true },
                        { name: "Shots Accuracy", value: `${weaponValues.shotsAccuracy}%`, inline: true },

                        { name: "Kills", value: weaponValues.kills, inline: true }
                    ];
                    message.channel.createMessage({
                        content: "",
                        embed: embed
                    });
                    break;
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
            let ratelimit = bot.util.cache.getCache("gameCSGO", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameCSGO", account.name.toLowerCase(), 0)) {
                let result = await superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/search?platform=steam&query=${account.name}`)
                    .set("TRN-Api-Key", tokens.games.csgo);
                return result.body.data;
            } else {
                return ratelimit.account_id;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account 
         * @param {String} accountID
        */
        async function getStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameCSGO", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameCSGO", account.name.toLowerCase(), 0)) {
                let result = await superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${accountID}`)
                    .set("TRN-Api-Key", tokens.games.csgo);
                return result.body.data;
            } else {
                return ratelimit.stats;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} accountID
        */
        async function getMaps(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameCSGO", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameCSGO", account.name.toLowerCase(), 0)) {
                let result = await superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${accountID}/segments/map`)
                    .set("TRN-Api-Key", tokens.games.csgo);
                return result.body.data;
            } else {
                return ratelimit.maps;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} accountID
        */
        async function getWeapons(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameCSGO", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameCSGO", account.name.toLowerCase(), 0)) {
                let result = await superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${accountID}/segments/weapon`)
                    .set("TRN-Api-Key", tokens.games.csgo);
                return result.body.data;
            } else {
                return ratelimit.weapons;
            }
        }

        /**
         * @param {String} name 
         * @param {Object} stat 
        */
        function percentile(name, stat) {
            let output = stat[name].displayValue;
            let percentile = stat[name].percentile;
            if (percentile != undefined && !isNaN(percentile)) {
                percentile = parseInt(percentile);
                if (percentile >= 50) {
                    output = `${stat[name].displayValue} (Top ${100 - percentile}%)`;
                } else {
                    output = `${stat[name].displayValue} (Bottom ${percentile}%)`;
                }
            }
            return output;
        }
    }
}