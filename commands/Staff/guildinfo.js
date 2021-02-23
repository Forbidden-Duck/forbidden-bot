const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class GuildInfo extends Commando.Command {
    constructor(bot) {
        super(bot, "guildinfo", "staff", {
            description: "Display guild-specific information MODERATOR+ ONLY",
            usage: "guildinfo [Guild]"
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
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                embed.description = "You must be Forbidden Moderator+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            const guildArg = args.join(" ");

            let guild;
            if (guildArg && guildArg.length > 0) {
                const parsedGuild = bot.util.parse.guildParse({
                    arg: guildArg
                }, { id: true, name: true });
                if (parsedGuild instanceof Eris.Guild) {
                    guild = parsedGuild;
                }
            } else {
                embed.description = "You need to enter a guild";
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (guild == undefined) {
                embed.description = `**${guildArg}** isn't a valid guild`;
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const count = guild.memberCount > 1000 ? 1000 : guild.memberCount;
            const members = await bot.getRESTGuildMembers(guild.id, count);
            for (const member of members) {
                guild.members.add(member);
            }

            const loadingCMD = await message.channel.createMessage(`Loading **${guild.name}**...`);

            embed.timestamp = new Date(guild.createdAt);
            embed.footer = {
                text: "Created at"
            };
            embed.author = {
                name: guild.name,
                icon_url: guild.iconURL || "attachment://imageBuffered.ping"
            };
            embed.fields = [
                { name: "Name", value: guild.name, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "ID", value: guild.id, inline: true },

                { name: "Owner", value: bot.util.useful.getUserTag(guild.ownerID), inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Owner ID", value: guild.ownerID, inline: true },

                { name: "Guild Prefix", value: bot.util.useful.getPrefix(guild), inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Region", value: guild.region, inline: true },

                { name: "Humans", value: guild.members.filter(member => !member.bot).length, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Bots", value: guild.members.filter(member => member.bot).length, inline: true },

                { name: "Text Channels", value: guild.channels.filter(channel => channel.type == 0).length, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Voice Channels", value: guild.channels.filter(channel => channel.type == 2).length, inline: true },

                { name: "Members", value: `${guild.memberCount} / ${guild.maxMembers}`, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Channels", value: guild.channels.size, inline: true },

                { name: "Roles", value: guild.roles.size, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Emojis", value: guild.emojis.length, inline: true }
            ];

            if (guild.iconURL == undefined) {
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