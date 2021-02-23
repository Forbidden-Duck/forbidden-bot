const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Donors extends Commando.Command {
    constructor(bot) {
        super(bot, "donors", "info", {
            description: "Display a list of the bot's current donators",
            usage: "donors"
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

            const forbiddenGuild = bot.guilds.get("250486125431488512");
            const donatorRoles = bot.util.data.getDonorRoles().map(rle => rle.id);

            const donatorMembers = forbiddenGuild.members
                .filter(member => member.roles.includes(donatorRoles[3]))
                .map(member => bot.util.useful.getUserTag(member.user))
                .join("\n");

            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL
                    },
                    description: `Donate with \`${prefix}donate\``,
                    fields: [
                        { name: "Donator ($5)", value: donatorMembers || "N/A" }
                    ]
                }
            });
        }
    }
}