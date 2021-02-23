const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");
const tokens = require("../../../tokens.json");
const r6API = require("r6api.js");
// @ts-ignore
const r6 = new r6API(tokens.accounts.ubisoft.username, tokens.accounts.ubisoft.password);
const modes = ["bomb", "secure", "hostage"];
const operators = {
    recruitsas: "Recruit SAS",
    recruitfbi: "Recruit FBI SWAT",
    recruitgign: "Recruit GIGN",
    recruitspetsnaz: "Recruit Spetsnaz",
    smoke: "Smoke",
    mute: "Mute",
    sledge: "Sledge",
    thatcher: "Thatcher",
    castle: "Castle",
    pulse: "Pulse",
    ash: "Ash",
    thermite: "Thermite",
    doc: "Doc",
    rook: "Rook",
    twitch: "Twitch",
    montagne: "Montagne",
    kapkan: "Kapkan",
    tachanka: "Tachanka",
    glaz: "Glaz",
    fuze: "Fuze",
    jager: "Jäger",
    bandit: "Bandit",
    blitz: "Blitz",
    iq: "IQ",
    frost: "Frost",
    buck: "Buck",
    valkyrie: "Valkyrie",
    blackbeard: "Blackbeard",
    caveira: "Caveira",
    capitao: "Capitão",
    echo: "Echo",
    hibana: "Hibana",
    mira: "Mira",
    jackal: "Jackal",
    lesion: "Lesion",
    ying: "Ying",
    ela: "Ela",
    zofia: "Zofia",
    vigil: "Vigil",
    dokkaebi: "Dokkaebi",
    lion: "Lion",
    finka: "Finka",
    maestro: "Maestro",
    alibi: "Alibi",
    clash: "Clash",
    maverick: "Maverick",
    kaid: "Kaid",
    nomad: "Nomad",
    mozzie: "Mozzie",
    gridlock: "Gridlock",
    warden: "Warden",
    nokk: "Nøkk",
    goyo: "Goyo",
    amaru: "Amaru",
    wamai: "Wamai",
    kali: "Kali",
    oryx: "Oryx",
    iana: "Iana"
};
const weaponTypes = {
    assault: "Assault Rifles",
    smg: "Submachine Guns",
    lmg: "Lighmachine Guns",
    marksman: "Marksman Rifles",
    pistol: "Pistols"
}

module.exports = class R6 extends Commando.Command {
    constructor(bot) {
        super(bot, "r6", "r6", {
            description: "Display r6siege-specific statistics",
            usage: "r6 [Name | User] [Mode | Operator | WeaponType]",
            aliases: ["r6siege"]
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
            const mOpWpn = args.slice(1).join(" ");

            if (nameUsr == undefined || nameUsr.length <= 0) {
                embed.description = "You need to enter a \`name\`, a \`user\` or \`me\`";
                embed.fields = [
                    {
                        name: "Tips",
                        value:
                            `type \`${prefix}${this.name} modes\` for all available modes\n` +
                            `type \`${prefix}${this.name} operators\` for all available operators\n` +
                            `type \`${prefix}${this.name} weapons\` for all available weapon types`
                    },
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr.toLowerCase() === "modes"
                || (mOpWpn && mOpWpn.toLowerCase() === "modes")) {
                embed.fields.push({ name: "Modes", value: modes.join(", "), inline: true });
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr.toLowerCase() === "operators"
                || (mOpWpn && mOpWpn.toLowerCase() === "operators")) {
                embed.description = "Make sure to use **ID** when search for operators";
                Object.entries(operators).forEach(op => {
                    embed.fields.push({ name: op[1], value: `**ID**: ${op[0]}`, inline: true });
                });
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (nameUsr.toLowerCase() === "weapons"
                || (mOpWpn && mOpWpn.toLowerCase() === "weapons")) {
                embed.description = "Make sure to use **ID** when search for weapon types";
                Object.entries(weaponTypes).forEach(ty => {
                    embed.fields.push({ name: ty[1], value: `**ID**: ${ty[0]}`, inline: true });
                });
                delete embed.timestamp;
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

            let viewType = "global";
            const viewTypeValue = {
                mode: undefined,
                operator: undefined,
                weapon: undefined
            };
            if (mOpWpn && mOpWpn.length > 0) {
                if (modes.includes(mOpWpn.toLowerCase())) {
                    viewType = "mode";
                    viewTypeValue.mode = modes.find(mode => mode === mOpWpn.toLowerCase());
                } else if (Object.keys(operators).find(op => op === mOpWpn.toLowerCase())) {
                    viewType = "operator";
                    viewTypeValue.operator = Object.entries(operators).find(op => op[0] === mOpWpn.toLowerCase())[0];
                } else if (Object.keys(weaponTypes).find(ty => ty === mOpWpn.toLowerCase())) {
                    viewType = "weapon";
                    viewTypeValue.weapon = Object.entries(weaponTypes).find(ty => ty[0] === mOpWpn.toLowerCase())[0];
                } else {
                    embed.description = `**${mOpWpn}** is not a valid \`mode\`, \`operator\` or \`weapon type\``;
                    embed.fields = [
                        {
                            name: "Tips",
                            value:
                                `type \`${prefix}${this.name} modes\` for all available modes\n` +
                                `type \`${prefix}${this.name} operators\` for all available operators\n` +
                                `type \`${prefix}${this.name} weapons\` for all available weapon types`
                        }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
            }

            const validatingCMD = await message.channel.createMessage(`Validating **${account.name}**`);

            let accountID;
            let stats;
            let level;
            let playtime;
            try {
                accountID = await getProfileID(bot, account);
                stats = await getStats(bot, account, accountID);
                level = await getLevel(bot, account, accountID);
                playtime = await getPlaytime(bot, account, accountID);
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
            const loadingCMD = await message.channel.createMessage(
                `Loading Statistics for **${account.name}**` +
                `${viewType === "mode"
                    ? ` on the mode **${viewTypeValue.mode}**`
                    : viewType === "operator"
                        ? ` on the operator **${viewTypeValue.operator}**`
                        : viewType === "weapon"
                            ? ` on the weapon type **${viewTypeValue.weapon}**`
                            : ""}`
            );

            if (stats == undefined || level == undefined || playtime == undefined) {
                loadingCMD.delete();
                embed.description = "I was unable to find your Stats, Level or Playtime";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameR6", account.name.toLowerCase(), 0)) {
                bot.util.cache.addCache("gameR6", account.name.toLowerCase(), 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    account_id: accountID,
                    stats: stats,
                    level: level,
                    playtime: playtime
                });
            }

            loadingCMD.delete();
            switch (viewType) {
                case "global":
                    stats = stats.pvp.general;
                    embed.description =
                        `**${account.name}** has eliminated themselves **${stats.suicides}** times`;
                    embed.fields = [
                        { name: "Username", value: account.name, inline: true },
                        { name: "Level", value: level.level, inline: true },
                        { name: "Alpha Pack Chance", value: level.lootboxProbability.percent, inline: true },

                        { name: "Kills", value: stats.kills, inline: true },
                        { name: "Deaths", value: stats.deaths, inline: true },
                        { name: "Kill/Death Ratio", value: (stats.kills / stats.deaths).toFixed(2), inline: true },

                        { name: "Headshots", value: stats.headshots, inline: true },
                        {
                            name: "Headshot Percentage",
                            value: `${(stats.headshots / stats.kills * 100).toFixed(0)}%`,
                            inline: true
                        },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Wins", value: stats.wins, inline: true },
                        { name: "Losses", value: stats.losses, inline: true },
                        { name: "Win Percentage", value: `${(stats.wins / stats.losses * 100).toFixed(0)}%`, inline: true },

                        { name: "Casual Playtime", value: `${(parseInt(playtime.casual) / 3600).toFixed(0)} hours`, inline: true },
                        { name: "Ranked Playtime", value: `${(parseInt(playtime.ranked) / 3600).toFixed(0)} hours`, inline: true },
                        { name: "Total Playtime", value: `${(parseInt(playtime.general) / 3600).toFixed(0)} hours`, inline: true },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                case "mode": {
                    stats = stats.pvp.modes;
                    const mode = stats[viewTypeValue.mode];

                    let timePlayed;
                    if (mode.playtime != undefined) {
                        let minutes = Math.floor((mode.playtime / 60) % 60);
                        let hours = Math.floor((mode.playtime / 3600) % 24);
                        if (hours <= 0) {
                            timePlayed = `${minutes} minutes`;
                        } else {
                            timePlayed = `${hours} hours and ${minutes} minutes`;
                        }
                    }

                    embed.fields = [
                        { name: "Username", value: account.name, inline: true },
                        { name: "Mode", value: mode.name, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Wins", value: mode.wins, inline: true },
                        { name: "Losses", value: mode.losses, inline: true },
                        { name: "Matches", value: mode.matches, inline: true },

                        { name: "Best Score", value: mode.bestScore, inline: true },
                        { name: "Playtime", value: timePlayed || "None", inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                    ];
                    if (viewTypeValue.mode === "secure") {
                        embed.fields.push(
                            { name: "Secured", value: mode.secured, inline: true },
                            { name: "Defended", value: mode.defended, inline: true },
                            { name: "Contested", value: mode.contested, inline: true },
                        );
                    } else if (viewTypeValue.mode === "hostage") {
                        embed.fields.push(
                            { name: "Hostages Rescued", value: mode.hostageRescued, inline: true },
                            { name: "Hostages Defended", value: mode.hostageDefended, inline: true }
                        );
                    }
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                case "operator": {
                    stats = stats.pvp.operators;
                    const operator = stats[viewTypeValue.operator];

                    let timePlayed;
                    if (operator.playtime != undefined) {
                        let minutes = Math.floor((operator.playtime / 60) % 60);
                        let hours = Math.floor((operator.playtime / 3600) % 24);
                        if (hours <= 0) {
                            timePlayed = `${minutes} minutes`;
                        } else {
                            timePlayed = `${hours} hours and ${minutes} minutes`;
                        }
                    }

                    embed.thumbnail = {
                        url: operator.badge
                    };
                    embed.fields = [
                        { name: "Username", value: account.name, inline: true },
                        { name: "Operator", value: operator.name, inline: true },
                        { name: "Role", value: operator.role, inline: true },

                        { name: "Kills", value: operator.kills, inline: true },
                        { name: "Melee Kills", value: operator.meleeKills, inline: true },
                        { name: "Headshots", value: operator.headshots, inline: true },

                        { name: "Wins", value: operator.wins, inline: true },
                        { name: "Losses", value: operator.losses, inline: true },
                        { name: "Playtime", value: timePlayed || "None", inline: true },

                        { name: "Deaths", value: operator.deaths, inline: true },
                        { name: "Downs", value: operator.dbno, inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        {
                            name:
                                "Gadgets",
                            value:
                                operator.gadget
                                    ? operator.gadget.map(gadget => `**${gadget.name}**: ${gadget.value}`).join("\n")
                                    : "None"
                        },
                    ];
                    message.channel.createMessage({ embed: embed });
                    break;
                }
                case "weapon": {
                    stats = stats.pvp.weapons;
                    const weapon = stats[viewTypeValue.weapon].general;

                    embed.fields = [
                        { name: "Username", value: account.name, inline: true },
                        { name: "Weapon Type", value: weaponTypes[viewTypeValue.weapon], inline: true },
                        // Add an empty field
                        { name: "\u200b", value: "\u200b", inline: true },

                        { name: "Kills", value: weapon.kills, inline: true },
                        { name: "Headshots", value: weapon.headshots, inline: true },
                        { name: "Shots Hit", value: weapon.bulletsConnected, inline: true },
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
            let ratelimit = bot.util.cache.getCache("gameR6", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6", account.name.toLowerCase(), 0)) {
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
        async function getStats(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameR6", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6", account.name.toLowerCase(), 0)) {
                return await r6.getStats("uplay", accountID).then(el => el[0]);
            } else {
                return ratelimit.stats;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} accountID
        */
        async function getLevel(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameR6", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6", account.name.toLowerCase(), 0)) {
                return await r6.getLevel("uplay", accountID).then(el => el[0]);
            } else {
                return ratelimit.level;
            }
        }

        /**
         * @param {Commando.CommandClient} bot 
         * @param {Object} account
         * @param {String} accountID
        */
        async function getPlaytime(bot, account, accountID) {
            let ratelimit = bot.util.cache.getCache("gameR6", account.name.toLowerCase(), 0);
            if (!bot.util.cache.checkLimit("gameR6", account.name.toLowerCase(), 0)) {
                return await r6.getPlaytime("uplay", accountID).then(el => el[0]);
            } else {
                return ratelimit.playtime;
            }
        }
    }
}