const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class ServerInvite extends Commando.Command {
    constructor(bot) {
        super(bot, "serverinvite", "basic", {
            description: "Link to join the support server (Official Forbidden Statistics Server)",
            usage: "serverinvite",
            aliases: ["support"]
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
                    description: "[Click Here to join a beautiful Discord Server](https://discord.gg/9HuJT7C)"
                }
            });
        }
    }
}