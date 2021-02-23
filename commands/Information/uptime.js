const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Uptime extends Commando.Command {
    constructor(bot) {
        super(bot, "uptime", "info", {
            description: "Display the current bot's uptime",
            usage: "uptime"
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

            const seconds = Math.floor((bot.uptime / 1000) % 60);
            const minutes = Math.floor((bot.uptime / 60000) % 60);
            const hours = Math.floor((bot.uptime / 3600000) % 24);
            const days = Math.floor((bot.uptime / 3600000 / 24));

            let uptime;
            if (days >= 1) {
                uptime = `${days}**d** : ${hours}**h** : ${minutes}**m** : ${seconds}**s**`
            } else if (hours >= 1) {
                uptime = `${hours}**h** : ${minutes}**m** : ${seconds}**s**`
            } else if (minutes >= 1) {
                uptime = `${minutes}**m** : ${seconds}**s**`
            } else {
                uptime = `${seconds}**s**`
            }

            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    description: `I have been online for ${uptime}`
                }
            });
        }
    }
}