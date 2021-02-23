const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class BotTime extends Commando.Command {
    constructor(bot) {
        super(bot, "bottime", "info", {
            description: "Display the bot's current time",
            usage: "bottime"
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
                    description: `It's currently **${moment().format('Do of MMMM YYYY, h:mma')}** for me`
                }
            });
        }
    }
}