const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Usage extends Commando.Command {
    constructor(bot) {
        super(bot, "usage", "basic", {
            description: "Provide information on the usage of a command",
            usage: "usage [Command]"
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

            let cmdArgument = args[0];
            if (!cmdArgument || cmdArgument.length <= 0) {
                cmdArgument = this.name;
            }

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            }

            const command =
                Object.values(bot.commands).find(cmd => cmd.name.startsWith(cmdArgument.toLowerCase())) ||
                Object.values(bot.commands).find(cmd => cmd.aliases.find(alias => alias.startsWith(cmdArgument.toLowerCase())));

            if (!command || command == undefined) {
                embed.description = `**${cmdArgument}** isn't a registered command`;
                embed.fields = [
                    { name: "Need help?", value: `Use \`${prefix}help\` to find commands` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            // @ts-ignore
            if (command.group.id !== "founder"
                && !bot.util.rolecheck.checkStaff(message.author, "isDeveloper")) {
                embed.description = `I'm not allowed to divulge classified information`;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const commandName = command.name.charAt(0).toUpperCase() + command.name.substring(1, command.name.length);
            const loadingCMD = await message.channel.createMessage(`Loading Usage for **${commandName}**`);

            embed.fields = [
                { name: commandName, value: command.description || "No description" },
                { name: "Example", value: command.usage && command.usage !== "No usage" ? prefix + command.usage : "No usage" }
            ];
            if (command.aliases && command.aliases.length > 0) {
                embed.fields.push({ name: "Aliases", value: command.aliases.join(", ") });
            }
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}