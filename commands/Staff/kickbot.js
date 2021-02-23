const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class KickBot extends Commando.Command {
    constructor(bot) {
        super(bot, "kickbot", "staff", {
            description: "Kick the bot from the specified guild MANAGER+ ONLY",
            usage: "kickbot [GUILD ID]"
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

            if (!bot.util.rolecheck.checkStaff(message.author, "isManager")) {
                embed.description = "You must be Forbidden Manager+ to use this command";
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

            const loadingCMD = await message.channel.createMessage(`Leaving guild **${guild.name}**`);
            try {
                await guild.leave();
            } catch (err) {
                embed.description = `Failed to leave **${guild.name}**`;
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
                return;
            }

            embed.description = `Successfully leave **${guild.name}**`;
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}