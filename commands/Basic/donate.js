const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Donate extends Commando.Command {
    constructor(bot) {
        super(bot, "donate", "basic", {
            description: "Link to the donation page",
            usage: "donate"
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
                    description: "[Click here to donate :)](https://www.patreon.com/forbiddenbot)"
                }
            });
        }
    }
}