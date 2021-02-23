// @ts-nocheck

const Eris = require("eris");
const Commando = require("eris.js-commando");
const types = ["text", "dm", "voice", "group dm", "category", "news", "store"];

module.exports = class Channel extends Commando.Command {
    constructor(bot) {
        super(bot, "channel", "server", {
            description: "Displays channel-specific information",
            usage: "channel [Channel]"
        });
    }

    /**
     * @param {Eris.Message} message 
     * @param {Array<String>} args
    */
    async execute(message, args) {
        const embed = {
            color: 0x2095AB,
            timestamp: new Date(),
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL
            },
            fields: []
        };
        if (message.guildID == undefined) {
            embed.description = "You can only use this command in servers";
            message.channel.createMessage({ embed: embed });
            return;
        }
        if (message.channel instanceof Eris.TextChannel) {
            const bot = this.client;
            const prefix = bot.util.useful.getPrefix(message.guildID);

            const channelArg = args.join(" ");

            let channel;
            if (channelArg && channelArg.length > 0) {
                const parsedChannel = bot.util.parse.channelParse(message.channel.guild, {
                    arg: channelArg,
                    mentions: message.channelMentions
                }, { id: true, name: true, mention: true });
                if (parsedChannel instanceof Eris.Channel) {
                    channel = parsedChannel;
                }
            } else {
                embed.description = "You haven't entered a channel";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (channel == undefined) {
                embed.description = `**${channelArg}** isn't a valid channel (or I can't see it)`;
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\``, inline: true },
                    { name: "Tip", value: `Try \`${prefix}channels\``, inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage(`Loading **${channel.name}**'s Information...`);

            embed.timestamp = new Date(channel.createdAt);
            embed.footer = {
                text: "Created at"
            };
            embed.author = {
                name: message.channel.guild.name,
                icon_url: message.channel.guild.iconURL || "attachment://imageBuffered.png"
            };
            embed.fields = [
                { name: "🎫 Name", value: channel.name, inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🖥️ ID", value: channel.id, inline: true },

                { name: "ℹ️ Type", value: types[channel.type], inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "↕️ Position", value: channel.position, inline: true },

                { name: "🔞 NSFW", value: channel.nsfw || "False", inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🏃‍♂️ Ratelimit", value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser} seconds` : "None", inline: true },

                { name: "👀 Viewable to you", value: channel.permissionsOf(message.author.id).has("readMessages"), inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                {
                    name: "👥 Viewable to", value:
                        `${message.channel.guild.members
                            .filter(mem => channel.permissionsOf(mem.id).has("readMessages")).length} members`, inline: true
                }
            ];

            if (message.channel.guild.iconURL == undefined) {
                const imageToBuffer = await bot.util.conversion.imageToBuffer("images/defaultIcon.png");
                loadingCMD.delete();
                message.channel.createMessage(
                    { embed: embed },
                    { file: imageToBuffer.name, name: `imageBuffered${imageToBuffer.extension}` });
            } else {
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            }
        }
    }
}