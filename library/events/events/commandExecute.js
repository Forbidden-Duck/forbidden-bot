// @ts-nocheck
const Eris = require("eris");
const Commando = require("eris.js-commando");

/** 
 * @param {Commando.CommandClient} bot 
 * @param {Commando.Command} cmd
 * @param {Eris.Message} message
 * @param {Array<String>} args
*/
module.exports = async (bot, cmd, message, args) => {
    const embed = {
        color: 0x2095AB,
        timestamp: new Date(),
        author: {
            name: message.author.username,
            icon_url: message.author.avatarURL
        },
        fields: []
    }

    await bot.provider.update("commands", { _id: cmd.name }, { $inc: { ["count.users." + message.author.id]: 1, "count.bot": 1 } }, true);

    const forbiddenGuild = bot.guilds.get("250486125431488512");
    const logChannel = forbiddenGuild.channels.get("730648002938535967");
    embed.fields = [{
        name: "User Tag", value: bot.util.useful.getUserTag(message.author), inline: true
    }, {
        // Add an empty field
        name: "\u200b", value: "\u200b", inline: true
    }, {
        name: "User ID", value: message.author.id, inline: true
    }, {
        name: "Guild Name", value: message.guildID ? bot.guilds.get(message.guildID).name : "Direct Message", inline: true
    }, {
        // Add an empty field
        name: "\u200b", value: "\u200b", inline: true
    }, {
        name: "Guild ID", value: message.guildID || "Direct Message", inline: true
    }, {
        name: "Channel Used", value: message.channel.name || message.author.username, inline: true
    }, {
        // Add an empty field
        name: "\u200b", value: "\u200b", inline: true
    }, {
        name: "Channel ID", value: message.channel.id, inline: true
    }, {
        name: "Command Used", value: cmd.name, inline: true
    }, {
        // Add an empty field
        name: "\u200b", value: "\u200b", inline: true
    }, {
        name: "Arguments Used", value: message.content.split(" ").slice(1).join(" ") || "None", inline: true
    }, {
        name: "Full Command", value: message.content, inline: true
    },];
    logChannel.createMessage({ embed: embed });

    if (cmd.group.id === "staff") {
        if (bot.util.rolecheck.checkStaff(message.author, "isSupport") == true) {
            const staffChannel = forbiddenGuild.channels.get("396979168757284864");
            staffChannel.createMessage({ embed: embed });
        }
    }
}