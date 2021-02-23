"use strict";

const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Eval extends Commando.Command {
    constructor(bot) {
        super(bot, "eval", "founder", {
            description: "Evaluate the provided code",
            usage: "eval [Code]",
            aliases: ["ev"]
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
            const code = args.join(" ");

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isOwner")) {
                embed.description = "You must be a Forbidden Owner+ to use this command";
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (!code || code.length <= 0) {
                embed.description = "Where is the code?";
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage("Processing code...");
            try {
                Promise.resolve(eval(code)).then(async (output) => {
                    if (code.length < 1000 && (output ? output.toString().length : 0) < 1000) {
                        embed.fields.push({ name: "Input", value: `\`\`\`js\n${code}\n\`\`\``, inline: false });
                        embed.fields.push({ name: "Output", value: `\`\`\`\n${output}\n\`\`\``, inline: false });
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                    } else if (code.length < 1970 && (output ? output.toString().length : 0) < 1970) {
                        await loadingCMD.delete();
                        await message.channel.createMessage(
                            `**INPUT**\n` +
                            `\`\`\`js\n` +
                            `${code}\n` +
                            `\`\`\`\n` +
                            `**INPUT**`
                        );
                        message.channel.createMessage(
                            `**OUTPUT**\n` +
                            `\`\`\`\n` +
                            `${output}\n` +
                            `\`\`\`\n` +
                            `**OUTPUT**`
                        );
                    } else {
                        embed.description = "Message too big to send";
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                    }
                });
            } catch (err) {
                loadingCMD.delete();
                message.channel.createMessage(
                    `**ERROR**\n` +
                    `\`\`\`\n` +
                    `${err}\n` +
                    `\`\`\`\n` +
                    `**ERROR**`
                );
            }
        }
    }
}