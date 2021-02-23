// @ts-nocheck
const Eris = require("eris");
const Commando = require("eris.js-commando");

/** 
 * @param {Commando.CommandClient} bot 
 * @param {Eris.Message} message
 * @param {Commando.Command} cmd 
 * @param {Error} err 
*/
module.exports = (bot, cmd, message, err) => {
    if (message.channel instanceof Eris.TextChannel
        || message.channel instanceof Eris.PrivateChannel) {
        if (bot.util.rolecheck.checkStaff(message.author, "isSupport")) {
            message.channel.createMessage(
                `Hello, **${bot.util.useful.getUserTag(message.author)}**. Since you're apart of our Staff Team, here is the Error.` +
                `\n\n\`${err ? err.stack ? err.stack : err : err}\``
            );
        } else {
            // #bot-error
            const logChannel = bot.guilds.get("250486125431488512").channels.get("395417403200110592");
            const prefix = bot.util.useful.getPrefix(message.channel.guild);

            message.channel.createMessage(
                `Hello, **${bot.util.useful.getUserTag(message.author)}** It appears I have had an error.\n` +
                `\`\`\`Full Command: ${message.content}\`\`\`` +
                `\`\`\`Error: ${err}\`\`\``
            );

            if (logChannel instanceof Eris.TextChannel) {
                try {
                    const embed = {
                        color: 0x2095AB,
                        timestamp: new Date(),
                        title: "Unexpected Error",
                        fields: [
                            { name: "Author", value: `${bot.util.useful.getUserTag(message.author)}\n${message.author.id}`, inline: true },
                            // Add an empty field
                            { name: "\u200b", value: "\u200b", inline: true },
                            {
                                name: "Guild", value:
                                    `${message.guildID
                                        ? `${message.channel.guild.name}\n${message.guildID}`
                                        : "DM"}`, inline: true
                            },
                            { name: "Full Command", value: `\`${message.content}\`` },
                            { name: "Error Message", value: err.message }
                        ]
                    };
                    logChannel.createMessage({ embed: embed });
                    // @ts-ignore
                    logChannel.createMessage(err ? err.stack ? err.stack : err : err);
                } catch (err) {
                    message.channel.createMessage(
                        `Failed to send error to the Staff Team.\nJoin my Server for help! **${prefix}serverinvite** ` +
                        `Then Click Here: <#310567294319460363>`
                    );
                }
            }
            bot.Logger.error(`Command Error : `, err);
        }
    }
}