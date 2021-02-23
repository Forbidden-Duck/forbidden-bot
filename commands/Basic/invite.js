const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Invite extends Commando.Command {
    constructor(bot) {
        super(bot, "invite", "basic", {
            description: "Link to invite the bot to your server",
            usage: "invite"
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
            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    description:
                        "[Click here for a beautiful Discord Bot]" +
                        "(https://discord.com/oauth2/authorize?client_id=305203825931845632&scope=bot&permissions=67464264)"
                }
            });
        }
    }
}