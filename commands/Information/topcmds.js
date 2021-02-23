const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class TopCmds extends Commando.Command {
    constructor(bot) {
        super(bot, "topcmds", "info", {
            description: "Displays the bot's (or users) top command usage",
            usage: "topcmds [User|me]"
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
            const userArg = args.join(" ");

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            let user;
            if (userArg && userArg.length > 0) {
                const parsedUser = bot.util.parse.userParse({
                    arg: userArg,
                    mentions: message.mentions
                }, {
                    id: true,
                    name: true,
                    tag: true,
                    mention: true
                });
                if (userArg.toLowerCase() === "me") {
                    user = message.author;
                } else {
                    user = parsedUser;
                }
            } else {
                user = bot.user;
            }

            if (user == undefined
                || !(user instanceof Eris.User)) {
                embed.description = `I couldn't find **${userArg}**. Are they real?!`;
                embed.fields = [
                    { name: "Tip", value: "Don't enter anything to view the bot's top commands" },
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (user.bot &&
                user.id !== bot.user.id) {
                embed.description =
                    `**${bot.util.useful.getUserTag(user)}** is a bot. Bots can't use commands!`;
                embed.fields = [
                    { name: "Tip", value: "Don't enter anything to view the bot's top commands" }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage(`Loading Top Commands for ${bot.util.useful.getUserTag(user)}`);
            const commandCount = await getCommandCount(bot);

            if (user.id === bot.user.id) {
                const commands =
                    Object.values(bot.commands)
                        .filter(cmd =>
                            commandCount[cmd.name] != undefined &&
                            commandCount[cmd.name].bot > 0 &&
                            // @ts-ignore
                            !["staff", "founder"].includes(cmd.group.id))
                        .sort((a, b) => commandCount[b.name].bot - commandCount[a.name].bot);

                for (let i = 0; i < 5; i++) {
                    const countLeft = commands[i];
                    const countRight = commands[i + 5];

                    if (countLeft != undefined) {
                        embed.fields.push({
                            name: i + 1, value:
                                `**Command**: ${commands[i].name}\n` +
                                `**Used**L ${commandCount[commands[i].name].bot} times`,
                            inline: true
                        });
                    } else {
                        embed.fields.push(
                            {
                                name: i + 1, value:
                                    `**Command**: N/A\n**Used**: N/A times`,
                                inline: true
                            }
                        );
                    }
                    // Blank field for formatting
                    embed.fields.push({ name: "\u200b", value: "\u200b", inline: true });

                    if (countRight != undefined) {
                        embed.fields.push(
                            {
                                name: i + 6, value:
                                    `**Command**: ${commands[i + 5].name}\n` +
                                    `**Used**: ${commandCount[commands[i + 5].name].bot} times`,
                                inline: true
                            }
                        );
                    } else {
                        embed.fields.push(
                            {
                                name: i + 6, value:
                                    `**Command**: N/A\n**Used**: N/A times`,
                                inline: true
                            }
                        );
                    }
                }

                embed.title = "Forbidden's Most Used Commands";
                embed.description = `Type \`${prefix}${this.usage}\` to get a user's (or your) command count`;
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            } else {
                const commands =
                    Object.values(bot.commands)
                        .filter(cmd =>
                            commandCount[cmd.name] != undefined &&
                            commandCount[cmd.name].users[user.id] > 0 &&
                            // @ts-ignore
                            !["staff", "founder"].includes(cmd.group.id))
                        .sort((a, b) => commandCount[b.name].users[user.id] - commandCount[a.name].users[user.id]);

                for (let i = 0; i < 5; i++) {
                    const countLeft = commands[i];
                    const countRight = commands[i + 5];

                    if (countLeft != undefined) {
                        embed.fields.push({
                            name: i + 1, value:
                                `**Command**: ${commands[i].name}\n` +
                                `**Used**L ${commandCount[commands[i].name].users[user.id]} times`,
                            inline: true
                        });
                    } else {
                        embed.fields.push(
                            {
                                name: i + 1, value:
                                    `**Command**: N/A\n**Used**: N/A times`,
                                inline: true
                            }
                        );
                    }
                    // Blank field for formatting
                    embed.fields.push({ name: "\u200b", value: "\u200b", inline: true });

                    if (countRight != undefined) {
                        embed.fields.push(
                            {
                                name: i + 6, value:
                                    `**Command**: ${commands[i + 5].name}\n` +
                                    `**Used**: ${commandCount[commands[i + 5].name].users[user.id]} times`,
                                inline: true
                            }
                        );
                    } else {
                        embed.fields.push(
                            {
                                name: i + 6, value:
                                    `**Command**: N/A\n**Used**: N/A times`,
                                inline: true
                            }
                        );
                    }
                }

                embed.title = `${user.id === message.author.id ? "Your" : `${bot.util.useful.getUserTag(user)}'s`} Most Used Commands`;
                embed.description = `Type \`${prefix}${this.name}\` to get the bot's command count`;
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            }
        }

        /**
         * @param {Commando.CommandClient} bot
        */
        async function getCommandCount(bot) {
            const commands = await bot.provider.find("commands", {}, {}, true);
            const commandsObj = {};
            for (const command of commands) {
                commandsObj[command._id] = command.count;
            }
            return commandsObj;
        }
    }
}