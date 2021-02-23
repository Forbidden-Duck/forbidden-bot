const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Dm extends Commando.Command {
    constructor(bot) {
        super(bot, "dm", "staff", {
            description: "DM a user using the bot MODERATOR+ ONLY",
            usage: "dm [User] | [Message]"
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
            const paramRegex = /[ ]-{1,2}[a-zA-Z]*/m;
            const param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                embed.description = "You must be Forbidden Moderator+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            args = args.join(" ").split(/[ ]{0,1}[|][ ]{0,1}/mi);
            const userArg = args[0] != undefined && args[0].replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const msgArg = args[1] != undefined && args.slice(1).join(" | ").replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
            const showAsText = param === "text" ? true : false;

            let user;
            if (userArg && userArg.length > 0) {
                const parsedUser = bot.util.parse.userParse({
                    arg: userArg,
                    mentions: message.mentions
                }, { id: true, tag: true, mention: true });
                if (parsedUser instanceof Eris.User) {
                    user = parsedUser;
                }
            } else {
                embed.description = "You need to enter a user";
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (user == undefined) {
                embed.description = `**${userArg}** isn't a valid user`;
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (user.bot) {
                embed.description = "You can't dm bots!";
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (!msgArg || msgArg.length <= 0) {
                embed.description = "You need to enter a message";
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage(`Sending a DM to **${bot.util.useful.getUserTag(user)}**...`);

            try {
                await user.getDMChannel().then(async (chn) => {
                    if (showAsText == true) {
                        await chn.createMessage(
                            `\`\`\`md\n# Do not reply to this message, no one can see it\`\`\`` +
                            `:incoming_envelope: Incoming Message from Staff Member **${bot.util.useful.getUserTag(message.author)}**\n\n` +
                            msgArg
                        );
                    } else {
                        await chn.createMessage({
                            embed: {
                                color: 0x2095AB,
                                timestamp: new Date(),
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL
                                },
                                description:
                                    `Do not reply to this message, no one can see it\n` +
                                    `:incoming_envelope: Incoming Message from Staff Member **${bot.util.useful.getUserTag(message.author)}**`,
                                fields: [
                                    { name: "Message", value: msgArg }
                                ]
                            }
                        });
                    }
                });
            } catch (err) {
                embed.description = "Failed to send message";
                embed.fields = [
                    { name: "Error", value: `\`${err}\`` }
                ];
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
                return;
            }

            embed.author = {
                name: message.author.username,
                icon_url: message.author.avatarURL
            }
            embed.description = "Message was sent successfully";
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}