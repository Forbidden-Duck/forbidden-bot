const Eris = require("eris");
const Commando = require("eris.js-commando");
const callofduty = require("call-of-duty-api")();
const moment = require("moment");
const tokens = require("../../../tokens.json");
const platforms = ["acti", "battle", "xbl", "psn"];
const params = ["mp", "wz", "params"];
const mpMM = {
    maps: {
        mp_m_speed: "Shoot House",
        mp_m_showers: "Gulag Showers",
        mp_m_king: "King",
        mp_m_speedball: "Speedball",
        mp_m_overunder: "Docks",
        mp_pine: "Pine",
        mp_m_pine: "Pine",
        mp_port2_gw: "Port of Verdansk",
        mp_downtown_gw: "Tarvorsk District",
        mp_farms2_gw: "Krovnik Farmland",
        mp_quarry2: "Karst River Quarry",
        mp_boneyard_gw: "Zhokov Boneyard",
        mp_cave_am: "Azhir Cave",
        mp_cave: "Azhir Cave (Night)",
        mp_hackney_am: "Hackney Yard",
        mp_hackney_yard: "Hackney Yard (Night)",
        mp_petrograd: "St. Petrograd",
        mp_euphrates: "Euphrates Bridge",
        mp_spear: "Rammaza",
        mp_spear_pm: "Rammaza (Night)",
        mp_runner: "Gun Runner",
        mp_runner_pm: "Gun Runner (Night)",
        mp_village2: "Hovec Sawmill",
        mp_backlot2: "Talsik Backlot",
        mp_raid: "Grazna Raid",
        mp_vacant: "Vacant",
        mp_rust: "Rust",
        mp_shipment: "Shipment",
        mp_crash2: "Crash",
        mp_piccadilly: "Piccadilly",
        mp_deadzone: "Arklov Peak",
        mp_hideout: "Khandor Hideout",
        mp_aniyah_tac: "Aniya Palace",
        mp_aniyah: "Aniya Palace",
        mp_garden: "Cheshire Park",
        mp_hardhat: "Hardhat",
        mp_m_cornfield: "Livestock",
        mp_m_wallco2: "Aisle 9",
        mp_m_stadium: "Verdansk Statium",
        mp_layover_gw: "Verdansk International Airport",
        mp_riverside_gw: "Verdansk Riverside",
        mp_m_train: "Station"
    },
    modes: {
        conf: "Kill Confirmed",
        conf_hc: "Kill Confirmed (Hardcore)",
        cyber: "Cyber Attack",
        cyber_hc: "Cyber Attack (Hardcore)",
        dom: "Domination",
        dom_hc: "Domination (Hardcore)",
        dm: "Free for all",
        hq: "Headquarters",
        koth: "Hardpoint",
        sd: "Search and Destroy",
        sd_hc: "Search and Destroy (Hardcore)",
        war: "Team Deathmatch",
        war_hc: "Team Deathmatch (Hardcore)",
        arena: "Gunfight",
        arm: "Ground War",
        infect: "Infected",
        dd: "Demolition",
        grind: "Grind"
    }
}
const wzMM = {
    maps: {
        mp_donetsk: "Verdansk",
        mp_don3: "Verdansk",
        mp_kstenod: "Verdansk (Night)"
    },
    modes: {
        br_87: "Battle Royale (Solo)",
        br_brduos: "Battle Royale (Duos)",
        br_25: "Battle Royale (Trios)",
        br_89: "Battle Royale (Quads)",
        br_71: "Battle Stimulus (Duos)",
        br_dmz_38: "Plunder",
        br_dmz_104: "Blood Money",
        br_dmz_plnbld: "Blood Money",
        brtdm_rmbl: "Warzone Rumble",
        br_br_real: "Realism Battle Royale",
        br_brquads: "Battle Royale (Quads)",
        br_brtrios: "Battle Royale (Trios)",
        br_zxp_zmbroy: "Zombie Royale"
    }
}

module.exports = class MwMatches extends Commando.Command {
    constructor(bot) {
        super(bot, "mwmatches", "mw", {
            description: "Display modern warfare match-specific statistics",
            usage: "mwmatches [Platform | User] [Name] [-Param]",
            aliases: ["modernwarfarematches"]
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
            let matchesToShow = 3;
            if (bot.util.rolecheck.checkDonor(message.author, "is$5")
                || bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                matchesToShow = 10;
            }

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
            if (params.includes(param.toLowerCase())) {
                if (param.toLowerCase() === "params") {
                    embed.description =
                        `Use params simply like ` +
                        `\`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -param\``
                    embed.fields.push({
                        name: "Params",
                        value: params.join(", ")
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
            const loadingCMD = await message.channel.createMessage(`Loading Matches for **${account.name}**`);

            if (!mp || !wz) {
                loadingCMD.delete();
                embed.description = "I was unable to find your MP or WZ stats";
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (!bot.util.cache.checkLimit("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                bot.util.cache.addCache("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0, {
                    ratelimit: moment().add(10, "minutes").valueOf(),
                    mp: mp,
                    wz: wz
                });
            }

            loadingCMD.delete();
            switch (viewType) {
                case "mp": {
                    embed.title = "Multiplayer Statistics";
                    const matches = getMatches(mp, matchesToShow);
                    let count = 1;

                    if (matches.length <= 0) {
                        embed.description = "No multiplayer matches was found";
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    for (const matchIndex in matches) {
                        const match = matches[matchIndex];
                        embed.fields.push({
                            name: `Match #${count++}`,
                            value: moment(match.utcStartSeconds * 1000).format('MMMM Do YYYY, h:mma'),
                            inline: matchesToShow > 3
                        });
                        if ((parseInt(matchIndex) + 1) % 2 != 0
                            && matchesToShow > 3) {
                            embed.fields.push({ name: "\u200b", value: "\u200b", inline: true });
                        }
                    }

                    await message.channel.createMessage({ embed: embed });
                    await message.channel.createMessage("Enter the match number to select that match (i.e. \`1\`)");
                    embed.fields = [];
                    embed.description = "";

                    const foundMatch = await getSingleMatch(bot, mp, matches);
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
                        const match = foundMatch[1].matchObj;

                        let gameDuration;
                        if (match.duration) {
                            let seconds = Math.floor((match.duration / 60) % 60);
                            let minutes = Math.floor((match.duration / 60000) % 60);
                            if (minutes < 1) {
                                gameDuration = `${seconds} seconds`;
                            } else {
                                gameDuration = `${minutes} minutes and ${seconds} seconds`;
                            }
                        }

                        let playStyle;
                        if (match.playerStats.percentTimeMoving) {
                            if (match.playerStats.percentTimeMoving < 40) {
                                playStyle = `Camper, spent ${match.playerStats.percentTimeMoving.toFixed(0)}% moving`;
                            } else if (match.playerStats.percentTimeMoving > 40 && match.playerStats.percentTimeMoving < 60) {
                                playStyle = `Strategic, spent ${match.playerStats.percentTimeMoving.toFixed(0)}% moving`;
                            } else if (match.playerStats.percentTimeMoving > 90) {
                                playStyle = `Always running, spent ${match.playerStats.percentTimeMoving.toFixed(0)}% moving`;
                            } else {
                                playStyle = `Sprinter, spent ${match.playerStats.percentTimeMoving.toFixed(0)}% moving`;
                            }
                        } else {
                            playStyle = "None";
                        }

                        let playerPresent;
                        if (match.isPresentAtEnd) {
                            playerPresent = `**${account.name}** stayed in the match \:)`;
                        } else {
                            playerPresent = `**${account.name}** left the match \:(`;
                        }

                        let usersName;
                        if (match.player.clantag != undefined) {
                            usersName = `[${match.player.clantag}] ${match.player.username}`;
                        } else {
                            usersName = match.player.username;
                        }

                        embed.description =
                            `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -wz\` for Warzone\n\n` +
                            `**${account.name}** eliminated themselves **${match.playerStats.suicides}** times\n` +
                            playerPresent;
                        embed.fields = [
                            {
                                name: "Game Started",
                                value: moment(match.utcStartSeconds * 1000).format('MMMM Do YYYY, h:mma'),
                                inline: true
                            },
                            { name: "Game Duration", value: gameDuration, inline: true },
                            { name: "Private Match", value: match.privateMatch, inline: true },

                            { name: "Mode", value: mpMM.modes[match.mode] || match.mode, inline: true },
                            { name: "Map", value: mpMM.maps[match.map] || match.map, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            { name: "Match Result", value: match.result, inline: true },
                            { name: "Player's Team", value: match.player.team, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            { name: "Username", value: usersName, inline: true },
                            { name: "Rank", value: match.player.rank, inline: true },
                            { name: "Play Style", value: playStyle, inline: true },

                            { name: "Kills", value: match.playerStats.kills, inline: true },
                            { name: "Deaths", value: match.playerStats.deaths, inline: true },
                            { name: "Kill/Death Ratio", value: match.playerStats.kdRatio.toFixed(2), inline: true },

                            { name: "Shots", value: `${match.playerStats.shotsLanded} / ${match.playerStats.shotsFired}`, inline: true },
                            {
                                name: "Hit Accuracy",
                                value: `${(match.playerStats.accuracy * 100).toFixed(0)}%`,
                                inline: true
                            },
                            { name: "Damage Done", value: match.playerStats.damageDone, inline: true },

                            { name: "Score", value: match.playerStats.score, inline: true },
                            { name: "Score per minute", value: match.playerStats.scorePerMinute.toFixed(0), inline: true },
                            { name: "Total XP", value: match.playerStats.totalXp, inline: true },

                            { name: "Nemesis", value: match.player.nemesis || "No nemesis", inline: true },
                            { name: "Target Practice", value: match.player.mostKilled || "No target practice", inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true }
                        ];
                        message.channel.createMessage({ embed: embed });
                    }
                    break;
                }
                case "wz": {
                    embed.title = "Warzone Statistics";
                    const matches = getMatches(wz, matchesToShow);
                    let count = 1;

                    if (matches.length <= 0) {
                        embed.description = "No warzone matches was found";
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    for (const matchIndex in matches) {
                        const match = matches[matchIndex];
                        embed.fields.push({
                            name: `Match #${count++}`,
                            value: moment(match.utcStartSeconds * 1000).format('MMMM Do YYYY, h:mma'),
                            inline: matchesToShow > 3
                        });
                        if ((parseInt(matchIndex) + 1) % 2 != 0
                            && matchesToShow > 3) {
                            embed.fields.push({ name: "\u200b", value: "\u200b", inline: true });
                        }
                    }

                    await message.channel.createMessage({ embed: embed });
                    await message.channel.createMessage("Enter the match number to select that match (i.e. \`1\`)");
                    embed.fields = [];
                    embed.description = "";

                    const foundMatch = await getSingleMatch(bot, wz, matches);
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
                        const match = foundMatch[1].matchObj;

                        let gameDuration;
                        if (match.duration) {
                            let seconds = Math.floor((match.duration / 60) % 60);
                            let minutes = Math.floor((match.duration / 60000) % 60);
                            if (minutes < 1) {
                                gameDuration = `${seconds} seconds`;
                            } else {
                                gameDuration = `${minutes} minutes and ${seconds} seconds`;
                            }
                        }

                        let placement = match.playerStats.teamPlacement;
                        if (placement != undefined) {
                            if (placement.toString().endsWith(1)
                                && !(placement.toString().startsWith(1) && placement.toString().length == 2)) {
                                placement = `${placement}st`
                            } else if (placement.toString().endsWith(2)
                                && !(placement.toString().startsWith(1) && placement.toString().length == 2)) {
                                placement = `${placement}nd`
                            } else if (placement.toString().endsWith(3)
                                && !(placement.toString().startsWith(1) && placement.toString().length == 2)) {
                                placement = `${placement}rd`
                            } else {
                                placement = `${placement}th`
                            }
                        }

                        let usersName;
                        if (match.player.clantag != undefined) {
                            usersName = `[${match.player.clantag}] ${match.player.username}`;
                        } else {
                            usersName = match.player.username;
                        }

                        embed.description =
                            `type \`${prefix}${this.name}${platUsr ? ` ${platUsr}` : ""}${nameArg ? ` ${nameArg}` : ""} -mp\` for Multiplayer`;
                        embed.fields = [
                            {
                                name: "Game Started",
                                value: moment(match.utcStartSeconds * 1000).format('MMMM Do YYYY, h:mma'),
                                inline: true
                            },
                            { name: "Game Duration", value: gameDuration, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            { name: "Mode", value: wzMM.modes[match.mode] || match.mode, inline: true },
                            { name: "Map", value: wzMM.maps[match.map] || match.map, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            { name: "Username", value: usersName, inline: true },
                            { name: "Rank", value: match.player.rank, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            {
                                name: "Plunder",
                                value: `$${match.rankedTeams != undefined && match.rankedTeams != null ? (match.rankedTeams
                                    .find(team => team.name === match.player.team).plunder * 1000).toLocaleString("en-US") || "0" : "0"}`,
                                inline: true
                            },
                            { name: "Team Placement", value: placement || "No placement", inline: true },
                            { name: "Total Players", value: match.playerCount || "0", inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },

                            { name: "Kills", value: match.playerStats.kills, inline: true },
                            { name: "Deaths", value: match.playerStats.deaths, inline: true },
                            { name: "Kill/Death Ratio", value: match.playerStats.kdRatio.toFixed(2), inline: true },

                            { name: "Damage Done", value: match.playerStats.damageDone, inline: true },
                            { name: "Damage Taken", value: match.playerStats.damageTaken, inline: true },
                            { name: "Distance Travelled", value: `${(match.playerStats.distanceTraveled / 100000).toFixed(0)}km`, inline: true },

                            { name: "Score", value: match.playerStats.score, inline: true },
                            { name: "Score per minute", value: match.playerStats.scorePerMinute.toFixed(0), inline: true },
                            { name: "Total XP", value: match.playerStats.totalXp, inline: true }
                        ];
                        embed.fields.forEach((item, index) => {
                            if (item.name === "Plunder") {
                                if (match.mode !== "br_dmz_38") {
                                    embed.fields.splice(index, 1);
                                } else {
                                    embed.fields.splice(index + 3, 1);
                                }
                            }
                        });

                        message.channel.createMessage({ embed: embed });
                    }
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
        function getMP(bot, account) {
            return new Promise((resolve, reject) => {
                let ratelimit = bot.util.cache.getCache("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    callofduty.login(tokens.accounts.activision.username, tokens.accounts.activision.password)
                        .then(() => {
                            callofduty.MWcombatmp(account.name, callofduty.platforms[account.platform])
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
                let ratelimit = bot.util.cache.getCache("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0);
                if (!bot.util.cache.checkLimit("gameMWM", `${account.platform}${account.name.toLowerCase()}`, 0)) {
                    callofduty.login(tokens.accounts.activision.username, tokens.accounts.activision.password)
                        .then(() => {
                            callofduty.MWcombatwz(account.name, callofduty.platforms[account.platform])
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

        /** 
         * @param {Object} obj 
         * @param {Number} max 
        */
        function getMatches(obj, max) {
            if (obj == undefined && obj.matches == undefined) {
                return [];
            }

            const matches = [];
            let count = 0;
            for (const match in obj.matches) {
                if (count == max) {
                    break;
                }
                if (obj.matches[match] != undefined) {
                    matches.push(obj.matches[match]);
                    count++;
                }
            }
            return matches;
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {Object} obj 
         * @param {Array} matches 
        */
        async function getSingleMatch(bot, obj, matches) {
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
                        if (obj.matches[matchNum - 1] == undefined) {
                            message.channel.createMessage(`${message.author.mention}, That's not right. I couldn't find that match`);
                        } else {
                            matchFound[0] = true;
                            matchFound[1] = {
                                num: matchNum,
                                matchObj: obj.matches[matchNum]
                            }
                        }
                    }
                }
            }

            return matchFound;
        }
    }
}