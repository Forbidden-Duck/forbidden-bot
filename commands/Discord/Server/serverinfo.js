const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class ServerInfo extends Commando.Command {
    constructor(bot) {
        super(bot, "serverinfo", "server", {
            description: "Display information of the current server",
            usage: "serverinfo",
            aliases: ["si", "server"]
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

            const loadingCMD = await message.channel.createMessage(`Loading **${message.channel.guild.name}**'s Information...`);

            embed.timestamp = new Date(message.channel.guild.createdAt);
            embed.footer = {
                text: "Created at"
            };
            embed.author = {
                name: message.channel.guild.name,
                icon_url: message.channel.guild.iconURL || "attachment://imageBuffered.png"
            };
            embed.thumbnail = {
                url: message.channel.guild.iconURL || "attachment://imageBuffered.ping"
            };
            embed.fields = [
                { name: "🎫 Name", value: message.channel.guild.name, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🖥️ ID", value: message.channel.guild.id, inline: true },

                { name: "🧙‍♂️ Owner", value: bot.util.useful.getUserTag(message.channel.guild.ownerID) || "Not Found", inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🖥️ Owner ID", value: message.channel.guild.ownerID || "None", inline: true },

                { name: "<:BotIcon:705721661025943563> Guild Prefix", value: prefix, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🏳️ Region", value: message.channel.guild.region, inline: true },
                {
                    name: "👶 Humans", value: message.channel.guild.members
                        .filter(member => !member.bot).length, inline: true
                },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🤖 Bots", value: message.channel.guild.members.filter(member => member.bot).length, inline: true },

                { name: "🔤 Text", value: message.channel.guild.channels.filter(channel => channel.type == 0).length, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "🔈 Voice", value: message.channel.guild.channels.filter(channel => channel.type == 2).length, inline: true },

                { name: "👥 Members", value: `${message.channel.guild.memberCount} / ${message.channel.guild.maxMembers}`, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "📔 Channels", value: message.channel.guild.channels.size, inline: true },
                { name: "📚 Roles", value: message.channel.guild.roles.size, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "<:JustDuck:387401631651856388> Emojis", value: message.channel.guild.emojis.length, inline: true }
            ];

            if (message.channel.guild.iconURL == undefined) {
                const imageToBuffer = await bot.util.conversion.imageToBuffer("images/defaultIcon.png");
                loadingCMD.delete();
                message.channel.createMessage(
                    { embed: embed },
                    // @ts-ignore
                    { file: imageToBuffer.name, name: `imageBuffered${imageToBuffer.extension}` });
            } else {
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            }
        }
    }
}