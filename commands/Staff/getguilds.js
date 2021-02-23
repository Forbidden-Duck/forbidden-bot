const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class GetGuilds extends Commando.Command {
    constructor(bot) {
        super(bot, "getguilds", "staff", {
            description: "Display a list of guilds DEVELOPER+ ONLY",
            usage: "getguilds [Page]"
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

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isDeveloper")) {
                embed.description = "You must be Forbidden Developer+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            // @ts-ignore
            const guilds = bot.guilds.map(guild => guild).sort((a, b) => b.joinedAt - a.joinedAt);
            for (const guild of guilds) {
                if (!bot.users.has(guild.ownerID)) {
                    await bot.getRESTUser(guild.ownerID).then(usr => bot.users.add(usr)).catch(() => { });
                }
            }
            const pagify = bot.util.useful.arrayPagify(guilds, parseInt(args[0]) || 0);

            const content =
                `|\`\`\`markdown\n# Page: #          |          # Max Page #` +
                `\n${pagify.currentPage}                  |          ${pagify.maxPages}\`\`\`` +
                `\n\n${pagify.arrayResult
                    .map(guild => `\`${guild.name}\` *${guild.ownerID ? bot.util.useful.getUserTag(guild.ownerID) : "Invalid Owner"}*` +
                        `\n*${guild.id}*`).join("\n\n")}`;
            const originalAuthor = message.author;
            message.author = bot.user;
            bot.commands.dm.execute(message, [originalAuthor.id, content]);

            // Fix message author so that Command Execute doesn't receive the wrong author
            message.author = originalAuthor;
        }
    }
}