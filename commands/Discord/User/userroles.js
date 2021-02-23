const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class UserRoles extends Commando.Command {
    constructor(bot) {
        super(bot, "userroles", "user", {
            description: "Display user roles for the specified user",
            usage: "userroles [User]",
            aliases: ["ur", "myroles"]
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

            const userArg = args.join(" ");

            let user;
            /**
             * @type {Eris.Member}
            */
            let member;
            if (userArg && userArg.length > 0) {
                const parsedUser = bot.util.parse.userParse({
                    arg: userArg,
                    mentions: message.mentions
                }, { id: true, name: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    user = parsedUser;
                }
            } else {
                user = message.author;
            }
            if (user == undefined) {
                embed.description = `**${userArg}** isn't a valid user`;
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\``, inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            // @ts-ignore
            if (message.channel.guild.members.has(user.id)) {
                // @ts-ignore
                member = message.channel.guild.members.get(user.id);
            } else {
                // @ts-ignore
                member = await bot.getRESTGuildMember(message.channel.guild.id, user.id).catch(() => { });
            }

            const loadingCMD = await message.channel.createMessage(`Loading **${bot.util.useful.getUserTag(user)}**'s Roles...`);

            let userRoles = member
                ? member.roles
                    // @ts-ignore
                    .map(role => message.channel.guild.roles.get(role))
                    .sort((a, b) => b.position - a.position)
                    .map(role => role.mention)
                    .join(", ")
                : [];

            embed.author = {
                name: user.username,
                icon_url: user.avatarURL
            };
            embed.fields = [
                {
                    name: `📚 Roles [${member.roles.length}]`,
                    value: userRoles || "None"
                }
            ];

            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}