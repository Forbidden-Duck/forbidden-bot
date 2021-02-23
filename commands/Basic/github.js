const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Github extends Commando.Command {
    constructor(bot) {
        super(bot, "github", "basic", {
            description: "Link to the bots Github Repository (No source code)",
            usage: "github"
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
                    description: "[Click here for the bot's Github](https://github.com/Forbidden-Duck/ForbiddenStatistics)"
                }
            });
        }
    }
}