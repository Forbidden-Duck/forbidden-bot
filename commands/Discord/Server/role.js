const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Role extends Commando.Command {
    constructor(bot) {
        super(bot, "role", "server", {
            description: "Display role-specific information",
            usage: "role [Role]"
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

            let roleArg = args.join(" ");

            let role;
            if (roleArg && roleArg.length > 0) {
                roleArg = roleArg.toLowerCase() === "everyone" ? "@everyone" : roleArg;
                const parsedRole = bot.util.parse.roleParse(message.channel.guild, {
                    arg: roleArg,
                    mentions: message.roleMentions
                }, { id: true, name: true, mention: true });
                if (parsedRole instanceof Eris.Role) {
                    role = parsedRole;
                }
            } else {
                embed.description = "You haven't entered a role";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (role == undefined) {
                embed.description = `**${roleArg}** isn't a valid role`;
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\``, inline: true },
                    { name: "Tip", value: `Try \`${prefix}roles\``, inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD =
                await message.channel.createMessage(`Loading **${role.name === "@everyone" ? "everyone" : role.name}**'s Information...`);

            let memberCount = 0;
            if (role.name === "@everyone") {
                memberCount = message.channel.guild.members.size;
            } else {
                memberCount = message.channel.guild.members.filter(mem => mem.roles.includes(role.id)).length;
            }

            let rolePerms;
            if (role.permissions.has("administrator")) {
                rolePerms = "administrator";
            } else {
                rolePerms = Object.entries(role.permissions.json).filter(item => item[1] != false).map(item => item[0]).join(", ") || "None";
            }

            embed.color = role.color
            embed.timestamp = new Date(message.channel.guild.createdAt);
            embed.footer = {
                text: "Created at"
            };
            embed.author = {
                name: message.channel.guild.name,
                icon_url: message.channel.guild.iconURL || "attachment://imageBuffered.png"
            };
            embed.fields = [
                { name: "🎫 Name", value: role.name, inline: true },
                { name: "🖥️ ID", value: role.id, inline: true },
                { name: "#️⃣ Hex Color", value: `#${role.color.toString(16)}`, inline: true },
                { name: "⬆️ Hoisted", value: role.hoist, inline: true },
                { name: "↕️ Position", value: role.position, inline: true },
                { name: "👥 Members", value: `${memberCount} members`, inline: true },
                { name: "<:DuckPing:387400969211609088> Mentionable", value: role.mentionable, inline: true },
                { name: "<:BotIcon:705721661025943563> Managed", value: role.managed, inline: true },
                // Add a empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "📖 Permissions", value: rolePerms }
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