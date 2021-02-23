const Eris = require("eris");
const Commando = require("eris.js-commando");

/**
 * @param {Commando.CommandClient} bot 
 * @param {Eris.Message} message
*/
module.exports = async (bot, message) => {
    if (!bot.util.rolecheck.checkTester(message.author)
        && !bot.util.rolecheck.checkStaff(message.author, "isTrialDeveloper")) {
        return;
    }
    if (message.author.bot) {
        return;
    }

    if ((await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0].blocks.commands == true
        && message.author.id !== bot.clientOptions.owner) {
        return;
    }

    if (message.content.replace(/<@!/g, "<@") === bot.user.mention
        && message.channel instanceof Eris.TextChannel) {
        message.content = `${bot.util.useful.getPrefix(message.channel.guild)}prefix`;
        bot.commands.prefix.process([], message);
    }
}