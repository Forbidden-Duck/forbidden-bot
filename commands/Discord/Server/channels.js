const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Channels extends Commando.Command {
    constructor(bot) {
        super(bot, "channels", "server", {
            description: "Displays all channels of the current server",
            usage: "channels"
        });
    }

    /**
     * @param {Eris.Message} message 
     * @param {Array<String>} args
    */
    async execute(message, args) {
        const embed = {
            color: 0x2095AB,
            timestamp: new Date(),
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL
            },
            fields: []
        };
        if (message.guildID == undefined) {
            embed.description = "You can only use this command in servers";
            message.channel.createMessage({ embed: embed });
            return;
        }
        if (message.channel instanceof Eris.TextChannel) {
            const bot = this.client;
            const prefix = bot.util.useful.getPrefix(message.guildID);

            const loadingCMD = await message.channel.createMessage(`Loading **${message.channel.guild.name}**'s Channels...`);

            let guildChannels = [];
            let rowCount = 0;
            // Loop through Text Channels
            // @ts-ignore
            for (let channel of message.channel.guild.channels
                .map(chn => chn).sort((a, b) => a.position - b.position).filter(chn => chn.type == 0).values()) {
                let channelMap = channel.mention;
                if (guildChannels && (guildChannels.join("").length + channelMap.length + (guildChannels.length * 2)) < 1000) {
                    rowCount++;
                    if (rowCount >= 3) {
                        channelMap += "\n";
                        rowCount = 0;
                    }
                    guildChannels.push(channelMap);
                }
            }

            rowCount = 0;
            // Loop through Voice Channels
            // @ts-ignore
            for (let channel of message.channel.guild.channels
                .map(chn => chn).sort((a, b) => a.position - b.position).filter(chn => chn.type == 2).values()) {
                let channelMap = channel.name;
                if (guildChannels && (guildChannels.join("").length + channelMap.length + (guildChannels.length * 2)) < 1000) {
                    rowCount++;
                    if (rowCount >= 3) {
                        channelMap += "\n";
                        rowCount = 0;
                    }
                    guildChannels.push(channelMap);
                }
            }
            const channels = guildChannels.join(", ").replace(/\n,/gi, ",\n");

            embed.author = {
                name: message.channel.guild.name,
                icon_url: message.channel.guild.iconURL || "attachment://imageBuffered.png"
            };
            embed.fields = [
                {
                    name: `📚 Channels [${message.channel.guild.channels.size}]`,
                    value: channels || "None"
                }
            ];

            if (message.channel.guild.iconURL == undefined) {
                const imageToBuffer = await bot.util.conversion.imageToBuffer("images/defaultIcon.png");
                loadingCMD.delete();
                message.channel.createMessage(
                    { embed: embed },
                    // @ts-ignore
                    { file: imageToBuffer.name, name: `imageBuffered${imageToBuffer.extension}` });
            } else {
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            }
        }
    }
}