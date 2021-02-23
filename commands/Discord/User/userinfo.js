const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class UserInfo extends Commando.Command {
    constructor(bot) {
        super(bot, "userinfo", "user", {
            description: "Display user-specific information on the specified user",
            usage: "userinfo [User]",
            aliases: ["ui", "user"]
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
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

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
            if (message.guildID != undefined) {
                // @ts-ignore
                if (message.channel.guild.members.has(user.id)) {
                    // @ts-ignore
                    member = message.channel.guild.members.get(user.id);
                } else {
                    // @ts-ignore
                    member = await bot.getRESTGuildMember(message.channel.guild.id, user.id).catch(() => { });
                }
            }

            const loadingCMD = await message.channel.createMessage(`Loading **${bot.util.useful.getUserTag(user)}**'s Information...`);

            let userRoles = member
                ? member.roles
                    // @ts-ignore
                    .map(role => message.channel.guild.roles.get(role))
                    .sort((a, b) => b.position - a.position)
                    .map(role => role.mention)
                    .join(", ")
                : "None";

            embed.timestamp = new Date(user.createdAt);
            embed.footer = {
                text: "Created at"
            };
            embed.author = {
                name: user.username,
                icon_url: user.avatarURL
            };
            embed.thumbnail = {
                url: user.avatarURL
            };
            embed.fields = [
                {
                    name: "🎫 Username",
                    value:
                        `${bot.util.useful.getUserTag(user)}` +
                        `${user.bot
                            ? "<:BotIcon:705721661025943563>"
                            : ""}`,
                    inline: true
                },
                { name: "<:GoldenTicket:705723842940895302> Nickname", value: member ? member.nick || "None" : "None", inline: true },
                { name: "🖥️ ID", value: user.id, inline: true },
                { name: "🔖 Created at", value: moment(user.createdAt).format("MMM Do YYYY, h:mma"), inline: true },
                {
                    name: "<a:ServerJOIN:505585240497061906> Joined at",
                    value:
                        member
                            ? moment(member.joinedAt).format("MMM Do YYYY, h:mma")
                            : "None"
                    , inline: true
                },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "📚 Roles", value: userRoles || "None" }
            ];

            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}