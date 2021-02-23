const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

/** 
 * @param {Commando.CommandClient} bot 
 * @param {Eris.Guild} guild 
*/
module.exports = async (bot, guild) => {
    // #new_guild_spam
    const postChannel = bot.guilds.get("250486125431488512").channels.get("371569591400529921");
    if (postChannel instanceof Eris.TextChannel) {
        const embed = {
            color: 0x2095AB,
            timestamp: new Date(),
            title: `Farewell Guild! ${bot.guilds.size}`,
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
        await bot.provider.update("guilds", { _id: guild.id }, { $set: { removedAt: new Date().valueOf() } }, true);

        bot.Logger.log("none", `&-3Guild Delete&r : &-c${bot.guilds.size}&r`);
    }
}