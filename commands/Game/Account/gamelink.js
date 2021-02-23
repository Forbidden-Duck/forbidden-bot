const Eris = require("eris");
const Commando = require("eris.js-commando");
const accountTypes = [
    {
        name: "games",
        display: "Games",
        aliases: ["game"],
        type: "special"
    },
    {
        name: "linked",
        display: "Linked",
        aliases: ["link"],
        type: "special"
    }, // Special types are not automatic like the games are
    {
        name: "overwatch",
        display: "Overwatch",
        aliases: ["ow"],
        type: "game",
        prompts: ["name", "platform"],
        options: {
            name: msg => msg.content.replace(/#/gi, "-"),
            platforms: ["pc", "xbl", "psn", "switch"]
        }
    },
    {
        name: "csgo",
        display: "CSGO",
        aliases: ["cs"],
        type: "game",
        prompts: ["name"],
        options: {
            name: msg => {
                if (msg.content.startsWith("<")
                    && msg.content.endsWith(">")) {
                    msg.content = msg.content.substring(1, msg.content.length - 1);
                }
                return encodeURIComponent(msg.content);
            }
        }
    },
    {
        name: "modernwarfare",
        display: "Modern Warfare",
        aliases: ["mw"],
        type: "game",
        prompts: ["name", "platform"],
        options: {
            platforms: ["acti", "battle", "psn", "xbl"]
        }
    },
    {
        name: "r6siege",
        display: "R6 Siege",
        aliases: ["r6"],
        type: "game",
        prompts: ["name"],
        options: {

        }
    },
    {
        name: "leagueoflegends",
        display: "League of Legends",
        aliases: ["lol"],
        type: "game",
        prompts: ["name", "region"],
        options: {
            name: msg => encodeURIComponent(msg.content),
            regions: ["na", "lan", "las", "eune", "euw", "oce", "br", "jp", "kr", "tr", "ru"]
        }
    },
    {
        name: "pubg",
        display: "PUBG",
        aliases: [],
        type: "game",
        prompts: ["name", "platform"],
        options: {
            name: msg => encodeURIComponent(msg.content),
            platforms: ["steam", "psn", "xbox"]
        }
    }
];

/**
 * @typedef {Object} types
 * @property {String} name
 * @property {String} display
 * @property {Array<String>} aliases
 * @property {String} type
 * @property {Array<String>} [prompts]
 * @property {Object} [options]
 * @property {Function} [options.name]
 * @property {Array<String>} [options.platforms]
 * @property {Array<String>} [options.regions]
*/

module.exports = class GameLink extends Commando.Command {
    constructor(bot) {
        super(bot, "gamelink", "account", {
            description: "Link a game-specific account",
            usage: "gamelink [Game]"
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

            const gameArg = args.join(" ");


            const commandCountDatabase = (await bot.provider.find("commands", { _id: this.name }, { limit: 1 }, true))[0].count;
            const commandCount =
                commandCountDatabase != undefined
                    ? commandCountDatabase.users != undefined
                        ? commandCountDatabase.users[message.author.id] != undefined
                            ? commandCountDatabase.users[message.author.id]
                            : 0
                        : 0
                    : 0
            if (commandCount == undefined || commandCount <= 0) {
                message.channel.createMessage(
                    `${message.author.mention}, this is your first time using the Game Linking Command.\n\n` +
                    `You can use this command to link game-specific accounts. Entering a game will provide you the necessary prompts\n` +
                    `To display a game's prompts type \`${prefix}${this.name} [Game]\` (i.e. ${prefix}${this.name} overwatch)\n` +
                    `Unlinking an account is the same process (if you have one linked already then it'll unlink it)\n\n` +
                    `Typing \`${prefix}${this.name} games\` will display all available games\n` +
                    `Typing \`${prefix}${this.name} linked\` will display all linked accounts`
                );
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

            /**
             * @type {types}
            */
            let accountType;
            if (gameArg && gameArg.length > 0) {
                if (accountTypes.find(type => type.name === gameArg)) {
                    accountType = accountTypes.find(type => type.name === gameArg);
                } else if (accountTypes.find(type => type.aliases.includes(gameArg))) {
                    accountType = accountTypes.find(type => type.aliases.includes(gameArg));
                }
            } else {
                embed.description = "You haven't entered a game";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\``, inline: true },
                    { name: "Tip", value: `Try \`${prefix}${this.name} games\``, inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (accountType == undefined) {
                embed.description = `**${gameArg}** isn't a valid game`;
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` },
                    { name: "Tip", value: `Try \`${prefix}${this.name} games\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage(`Loading **${accountType.name}**...`);
            const linkedAccounts = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0].linkedAccounts;

            if (accountType.type === "special") {
                switch (accountType.name) {
                    case "games":
                        const special = [];
                        accountTypes.filter(type => type.type === "special")
                            .forEach(type => {
                                special.push(type.display);
                            });

                        const games = [];
                        accountTypes.filter(type => type.type === "game")
                            .forEach(type => {
                                games.push(
                                    type.display +
                                    `${type.aliases && type.aliases[0]
                                        ? ` (${type.aliases[0]})`
                                        : ""}`
                                );
                            });

                        embed.fields = [
                            { name: "Special", value: special.join("\n") || "None", inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },
                            { name: "Games", value: games.join("\n") || "None", inline: true }
                        ];
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                        return;
                    case "linked":
                        if (Object.values(linkedAccounts).length > 0) {
                            for (const accountIdx in Object.values(linkedAccounts.games)) {
                                const account = Object.values(linkedAccounts.games)[accountIdx];
                                embed.fields.push({
                                    name: account.display,
                                    value: Object.entries(account)
                                        .filter(item => item[0].toLowerCase() !== "display" && item[1] != undefined)
                                        .map(item => `**${upperFirst(item[0])}**: ${item[1]}`)
                                        .join("\n") || "None",
                                    inline: true
                                });
                                if (parseInt(accountIdx) / 2 % 1 == 0) {
                                    // If divisible by 2
                                    // Add empty field
                                    embed.fields.push({
                                        name: "\u200b",
                                        value: "\u200b",
                                        inline: true
                                    });
                                }
                            }
                        } else {
                            embed.description = "No accounts have been linked yet";
                        }
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                        return;
                }
            } else if (accountType.type === "game") {
                loadingCMD.delete();
                if (linkedAccounts.games != undefined &&
                    linkedAccounts.games[accountType.name] != undefined) {
                    unlink(bot, linkedAccounts, accountType);
                } else {
                    const prompts = await getPrompts(bot, accountType);
                    if (prompts == undefined) {
                        return;
                    }
                    try {
                        await bot.util.account[`${accountType.name}Validate`](...prompts.accounts);
                    } catch (err) {
                        prompts.loadingCMD.delete();
                        embed.fields.push(
                            { name: "Error", value: err.message || err || "None" }
                        );
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    if (linkedAccounts.games == undefined) {
                        linkedAccounts.games = {};
                    }
                    linkedAccounts.games[accountType.name] = {
                        display: accountType.display,
                        name: accountType.prompts.includes("name") == true ? prompts.accounts[0] : undefined,
                        platform: accountType.prompts.includes("platform") == true ? prompts.accounts[1] : undefined,
                        region:
                            accountType.prompts.includes("region") == true
                                ? accountType.prompts.includes("platform") == true
                                    ? prompts.accounts[2]
                                    : prompts.accounts[1]
                                : undefined
                    };
                    await bot.provider.update("users", { _id: message.author.id }, {
                        $set:
                            { ["linkedAccounts.games." + accountType.name]: linkedAccounts.games[accountType.name] }
                    }, true);
                    embed.description = `Successfully Linked your ${accountType.display} Account`;
                    prompts.loadingCMD.delete();
                    message.channel.createMessage({ embed: embed });
                }
            } else {
                embed.description = "Well that wasn't supposed to happen";
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            }
            return;
        }

        function upperFirst(str) {
            return str.charAt(0).toUpperCase() + str.substring(1, str.length);
        }

        /** 
         * @param {Commando.CommandClient} bot
         * @param {Object} linkedAccounts
         * @param {types} account 
        */
        async function unlink(bot, linkedAccounts, account) {
            const loadingCMD = await message.channel.createMessage(`Unlinking ${account.display}...`);
            delete linkedAccounts.games[account.name];
            await bot.provider.update("users", { _id: message.author.id }, {
                $unset: { ["linkedAccounts.games." + account.name]: "" }
            }, true);

            loadingCMD.delete();
            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    timestamp: new Date(),
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL
                    },
                    description: `${account.display} has been unlinked successfully`
                }
            });
        }

        /** 
         * @param {Commando.CommandClient} bot
         * @param {types} account 
        */
        async function getPrompts(bot, account) {
            let loadingCMD = await message.channel.createMessage(`Loading Prompts for ${account.display}`);
            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const prompts = account.prompts;
            const userRes = {
                name: [null, null],
                platform: [null, null],
                region: [null, null]
            };

            embed.description = "Follow the prompts\ntype `cancel` at any time";
            await loadingCMD.delete();
            loadingCMD = await message.channel.createMessage({ embed: embed });

            if (prompts.includes("name")) {
                let msg = await message.channel.createMessage(`${message.author.mention}, Please enter the account's name`);

                while (userRes.name[0] == null) {
                    let temp = await bot.util.useful.awaitMessage(
                        message.channel,
                        // @ts-ignore
                        msg =>
                            msg.author.id === message.author.id
                            && msg.channel.id === message.channel.id,
                        60000
                    ).catch(err => {
                        userRes.name[0] = false;
                        userRes.name[1] = err;
                    });
                    if (userRes.name[0] == false) {
                        continue;
                    }
                    if (temp instanceof Eris.Message) {
                        if (account.options.name && temp.content.toLowerCase() !== "cancel") {
                            temp.content = account.options.name(temp);
                        }
                        userRes.name[0] = true;
                        userRes.name[1] = temp.content;
                    }
                }
                msg.delete();

                if (typeof userRes.name[1] === "string" && userRes.name[1].toLowerCase() === "cancel") {
                    embed.description = "Linking Process Cancelled";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed: embed });
                    return;
                }

                if (!userRes.name[0]) {
                    switch (userRes.name[1].message) {
                        case "idle":
                            embed.description = "Took too long to respond";
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                        case "channelDelete":
                            return;
                        case "guildDelete":
                            return;
                        default:
                            embed.description = `Error: ${userRes.name[1].message}`;
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                    }
                } else {
                    await loadingCMD.delete();
                    embed.fields.push({ name: "Name", value: userRes.name[1], inline: true });
                    if (prompts.includes("platform") || prompts.includes("region")) {
                        loadingCMD = await message.channel.createMessage({ embed: embed });
                    }
                }
            }

            if (prompts.includes("platform")) {
                let msg = await message.channel.createMessage(
                    "type `platforms` for the available platforms\n" +
                    `${message.author.mention}, Please enter the account's platform`
                );

                while (userRes.platform[0] == null) {
                    let temp = await bot.util.useful.awaitMessage(
                        message.channel,
                        // @ts-ignore
                        msg =>
                            msg.author.id === message.author.id
                            && msg.channel.id === message.channel.id,
                        60000
                    ).catch(err => {
                        userRes.platform[0] = false;
                        userRes.platform[1] = err;
                    });
                    if (userRes.platform[0] == false) {
                        continue;
                    }
                    if (temp instanceof Eris.Message) {
                        temp.content = temp.content.toLowerCase();

                        if (account.options.platforms.includes(temp.content)
                            || temp.content === "cancel") {
                            userRes.platform[0] = true;
                            userRes.platform[1] = temp.content;
                        } else if (temp.content === "platforms") {
                            message.channel.createMessage(
                                `${message.author.mention}, The available platforms are ` +
                                `\`${account.options.platforms.join(", ")}\``
                            );
                        } else {
                            message.channel.createMessage(
                                `${message.author.mention}, **${temp.content}** isn't a platform.` +
                                " type `platforms` to view all platforms"
                            );
                        }
                    }
                }
                msg.delete();

                if (userRes.platform[1] && userRes.platform[1].toLowerCase() === "cancel") {
                    embed.description = "Linking Process Cancelled";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed: embed });
                    return;
                }

                if (!userRes.platform[0]) {
                    switch (userRes.platform[1].message) {
                        case "idle":
                            embed.description = "Took too long to respond";
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                        case "channelDelete":
                            return;
                        case "guildDelete":
                            return;
                        default:
                            embed.description = `Error: ${userRes.platform[1].message}`;
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                    }
                } else {
                    await loadingCMD.delete();
                    embed.fields.push({ name: "Platform", value: userRes.platform[1], inline: true });
                    if (prompts.includes("region")) {
                        loadingCMD = await message.channel.createMessage({ embed: embed });
                    }
                }
            }

            if (prompts.includes("region")) {
                let msg = await message.channel.createMessage(
                    "type `regions` for the available regions\n" +
                    `${message.author.mention}, Please enter the account's region`
                );

                while (userRes.region[0] == null) {
                    let temp = await bot.util.useful.awaitMessage(
                        message.channel,
                        // @ts-ignore
                        msg =>
                            msg.author.id === message.author.id
                            && msg.channel.id === message.channel.id,
                        60000
                    ).catch(err => {
                        userRes.region[0] = false;
                        userRes.region[1] = err;
                    });
                    if (userRes.region[0] == false) {
                        continue;
                    }
                    if (temp instanceof Eris.Message) {
                        temp.content = temp.content.toLowerCase();

                        if (account.options.regions.includes(temp.content)
                            || temp.content === "cancel") {
                            userRes.region[0] = true;
                            userRes.region[1] = temp.content;
                        } else if (temp.content === "regions") {
                            message.channel.createMessage(
                                `${message.author.mention}, The available regions are ` +
                                `\`${account.options.regions.join(", ")}\``
                            );
                        } else {
                            message.channel.createMessage(
                                `${message.author.mention}, **${temp.content}** isn't a region.` +
                                " type `regions` to view all regions"
                            );
                        }
                    }
                }
                msg.delete();

                if (userRes.region[1] && userRes.region[1].toLowerCase() === "cancel") {
                    embed.description = "Linking Process Cancelled";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed: embed });
                    return;
                }

                if (!userRes.region[0]) {
                    switch (userRes.region[1].message) {
                        case "idle":
                            embed.description = "Took too long to respond";
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                        case "channelDelete":
                            return;
                        case "guildDelete":
                            return;
                        default:
                            embed.description = `Error: ${userRes.region[1].message}`;
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                            return;
                    }
                } else {
                    await loadingCMD.delete();
                    embed.fields.push({ name: "Region", value: userRes.region[1], inline: true });
                    loadingCMD = await message.channel.createMessage({ embed: embed });
                }
            }

            embed.description = `Validating ${account.display} Account...`;
            await loadingCMD.delete().catch(() => { });
            return {
                accounts: Object.values(userRes).filter(res => res[0] == true).map(res => res[1]),
                loadingCMD: await message.channel.createMessage({ embed: embed })
            };
        }
    }
}