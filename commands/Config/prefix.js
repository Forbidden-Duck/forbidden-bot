const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Prefix extends Commando.Command {
    constructor(bot) {
        super(bot, "prefix", "config", {
            description: "View or change the server prefix",
            usage: "Prefix [Prefix|default]"
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
            let prefixArg = args.join(" ");

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            if (!prefixArg && prefixArg.length <= 0) {
                // @ts-ignore
                embed.description = `**${message.guildID ? `${message.channel.guild.name}'s` : "My"}** Prefix is \`${prefix}\``;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (!(message.channel instanceof Eris.TextChannel)) {
                embed.description = "You must be in a server to set a prefix";
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (message.channel.guild.ownerID !== message.author.id
                && (!message.channel.permissionsOf(message.author.id).has("administrator")
                    || !message.channel.permissionsOf(message.author.id).has("manageGuild"))
                && !bot.util.rolecheck.checkStaff(message.author, "isManager")) {
                embed.description = "You must have **Administrator** or **Manager Server** permissions to set the prefix";
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (prefixArg.replace(/<@!/g, "<@") === bot.user.mention) {
                embed.description = "You can't set the prefix as the bot's mention";
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (["none", "default"].includes(prefixArg.toLowerCase())) {
                prefixArg = bot.clientOptions.prefix;
            }
            const loadingCMD = await message.channel.createMessage(`Setting prefix to \`${prefixArg}\``);

            await bot.provider.updatePrefix(message.channel.guild.id, prefixArg);
            embed.fields = [
                { name: "Previous Prefix", value: prefix, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "New Prefix", value: bot.util.useful.getPrefix(message.guildID), inline: true }
            ];
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}