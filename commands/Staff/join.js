const { Channel } = require("eris");
const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Join extends Commando.Command {
    constructor(bot) {
        super(bot, "join", "staff", {
            description: "Create an invite for the specified guild DEVELOPER+ ONLY",
            usage: "join [GUILD ID]"
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

            if (!bot.util.rolecheck.checkStaff(message.author, "isDeveloper")) {
                embed.description = "You must be Forbidden Developer+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            const guildArg = args.join(" ");

            let guild;
            if (guildArg && guildArg.length > 0) {
                const parsedGuild = bot.util.parse.guildParse({
                    arg: guildArg
                }, { id: true });
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

            const loadingCMD = await message.channel.createMessage("Creating Invite...");

            // @ts-ignore
            for (let [ignore, chn] of guild.channels) {
                if (chn.permissionsOf(bot.user.id).has("createInstantInvite")) {
                    try {
                        const invite = await chn.createInvite(
                            { maxAge: 300, maxUses: 5 },
                            `Created by ${bot.util.useful.getUserTag(message.author)}`
                        );
                        const content = `|Invite for **${guild.name}**: discord.gg/${invite.code} -text`;
                        const originalAuthor = message.author;
                        message.author = bot.user;
                        loadingCMD.delete();
                        bot.commands.dm.execute(message, [originalAuthor.id, content])
                        return;
                    } catch (err) {
                        embed.description = "Failed to create invite";
                        embed.fields = [
                            { name: "Error", value: `\`\`\`${err}\`\`\`` }
                        ];
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                        return;
                    }
                }
            }

            embed.description = "Failed to find a valid channel";
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
            return;
        }
    }
}