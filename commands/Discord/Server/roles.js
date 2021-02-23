const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Roles extends Commando.Command {
    constructor(bot) {
        super(bot, "roles", "server", {
            description: "Display all roles for the current server",
            usage: "roles"
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

            const loadingCMD = await message.channel.createMessage(`Loading **${message.channel.guild.name}**'s Roles...`);

            let guildRoles = [];
            let rowCount = 0;
            // @ts-ignore
            for (let role of message.channel.guild.roles.map(role => role).sort((a, b) => b.position - a.position).values()) {
                let members = 0;
                if (role.name === "@everyone") {
                    members = message.channel.guild.members.size;
                } else {
                    members = message.channel.guild.members.filter(mem => mem.roles.includes(role.id)).length;
                }

                let roleMap = `${role.mention} [${members}]`;
                if (role.name !== "@everyone" && !role.managed) {
                    // Length doesn't exceed 1000
                    if (guildRoles && (guildRoles.join("").length + roleMap.length + (guildRoles.length * 2)) < 1000) {
                        rowCount++;
                        if (rowCount >= 3) {
                            roleMap += "\n";
                            rowCount = 0;
                        }
                        guildRoles.push(roleMap);
                    } else {
                        guildRoles.push("...");
                        break;
                    }
                }
            }
            const roles = guildRoles.join(", ").replace(/\n,/gi, ",\n");

            embed.author = {
                name: message.channel.guild.name,
                icon_url: message.channel.guild.iconURL || "attachment://imageBuffered.png"
            };
            embed.fields = [
                {
                    name: `📚 Roles [${message.channel.guild.roles.size - 1}]`,
                    value: roles || "None"
                }
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