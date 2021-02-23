const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");

module.exports = class Duck extends Commando.Command {
    constructor(bot) {
        super(bot, "duck", "basic", {
            description: "A super epic Duck command",
            usage: "duck"
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
            const loadingCMD = await message.channel.createMessage("Loading Duck <:DuckLove:387400364619464705>...");

            let image;
            try {
                const req = await superagent.get("https://random-d.uk/api/v2/random");
                image = req.body.url;
            } catch (err) {
                loadingCMD.delete();
                message.channel.createMessage({
                    embed: {
                        color: 0x2095AB,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL
                        },
                        description: "Unexpected Error \:(",
                        fields: [
                            { name: "Error", value: `\`\`\`${err}\`\`\`` }
                        ]
                    }
                });
                return;
            }

            loadingCMD.delete();
            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    description: "Oh look it's my creator <:JustDuck2:387422042011598859>",
                    image: {
                        url: image
                    }
                }
            });
        }
    }
}