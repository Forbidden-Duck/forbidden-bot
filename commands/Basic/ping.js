const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Ping extends Commando.Command {
    constructor(bot) {
        super(bot, "ping", "basic", {
            description: "Provides ping information of the bot",
            usage: "ping"
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
            let apiPing = 0;
            if (message.channel instanceof Eris.TextChannel) {
                apiPing = Math.trunc(message.channel.guild.shard.latency);
            } else {
                apiPing = Math.trunc(bot.shards.get(0).latency);
            }
            message.channel.createMessage("Pinging...")
                .then(sendMessage => {
                    sendMessage.edit({
                        content: "",
                        embed: {
                            color: 0x2095AB,
                            title: "Pong! :ping_pong:",
                            description:
                                `**Discord API**: ${apiPing}ms\n` +
                                `**Response Time**: ${sendMessage.timestamp - message.timestamp}ms`
                        }
                    });
                });
        }
    }
}