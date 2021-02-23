const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

/** 
 * @param {Commando.CommandClient} bot 
 * @param {Eris.Guild} guild 
*/
module.exports = async (bot, guild) => {
    const prefix = bot.util.useful.getPrefix(guild);

    const guildDocument = (await bot.provider.find("guilds", { _id: guild.id }, { limit: 1 }))[0] || {};
    let guildReceived = guildDocument.receivedMessage || false;
    const guildRemovedAt = guildDocument.removedAt || 0;
    const timeSinceLeft = guildRemovedAt;
    const SixMonths = moment().subtract(6, "months").valueOf();

    if (timeSinceLeft < SixMonths && guildReceived == true) {
        guildReceived == false;
        await bot.provider.update("guilds", { _id: guild.id }, { $set: { receivedMessage: false } }, true);
    }
    if (timeSinceLeft < SixMonths && guildReceived == false) {
        const defaultChannel = bot.util.useful.getDefaultChannel(guild);
        if (defaultChannel != undefined
            && defaultChannel instanceof Eris.TextChannel) {
            if (defaultChannel.permissionsOf(bot.user.id).has("sendMessages")
                && defaultChannel.permissionsOf(bot.user.id).has("attachFiles")) {
                const content =
                    `\`\`\`markdown\n# Forbidden Discord Bot #\`\`\`<a:blobwave:505588244138819584> Hey! Thanks for adding me!\n` +
                    `I am a General Statistics Bot that will provide you with a features based around Games and Discord. ` +
                    `Tons of games will be continiously to be added as the bot goes on.\n\n` +

                    `Let's get started! Our help command is \`${prefix}help [Category]\` this should help you get started!\n` +
                    `To change the prefix you can type \`${prefix}prefix [Prefix]\`\n\n` +

                    `Want to request a feature to be added to me? It's easy peasy just run this command \`${prefix}suggest [Suggestion]\` ` +
                    `*remember abusers are punished*\nWant to receive announcements? Get some help on the bot? ` +
                    `Chat with some of our fellow server members? Join Forbidden's Official Server! \`${prefix}serverinvite\``;
                const imageToBuffer = await bot.util.conversion.imageToBuffer("images/onGuildJoin/ForbiddenBanner1.gif");
                await defaultChannel.createMessage(
                    { content: "\u200b" },
                    // @ts-ignore
                    { file: imageToBuffer.imageBuffer, name: `imageBuffered${imageToBuffer.extension}` }
                );
                defaultChannel.createMessage(content);
                await bot.provider.update("guilds", { _id: guild.id }, { $set: { receivedMessage: true } }, true);
            }
        }
    }

    // #new_guild_spam
    const postChannel = bot.guilds.get("250486125431488512").channels.get("371569591400529921");
    if (postChannel instanceof Eris.TextChannel) {
        const embed = {
            color: 0x2095AB,
            timestamp: new Date(),
            title: `New Guild! ${bot.guilds.size}`,
            author: {
                name: guild.name,
                icon_url: guild.iconURL || "attachment://imageBuffered.png"
            },
            fields: [
                { name: "Name", value: guild.name, inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "ID", value: guild.id, inline: true },
                { name: "Owner", value: bot.util.useful.getUserTag(bot.users.get(guild.ownerID)), inline: true },
                // Add an empty field
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "Owner ID", value: guild.ownerID, inline: true }
            ]
        };

        if (guild.iconURL == undefined) {
            const imageToBuffer = await bot.util.conversion.imageToBuffer("images/defaultIcon.png");
            postChannel.createMessage(
                { embed: embed },
                // @ts-ignore
                { file: imageToBuffer.imageBuffer, name: `imageBuffered${imageToBuffer.extension}` }
            );
        } else {
            postChannel.createMessage({ embed: embed });
        }
    }

    bot.Logger.log("none", `&-3Guild Create&r : &-c${bot.guilds.size}&r`);
}