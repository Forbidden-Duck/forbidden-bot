// @ts-nocheck
const Eris = require("eris");
const Commando = require("eris.js-commando");

/**
 * @param {Commando.Command} cmd 
 * @param {Eris.Message} message 
 * @param {Array<String>} args 
*/
module.exports = async (cmd, message, args) => {
    const bot = cmd.client;
    const prefix = bot.util.useful.getPrefix(message.guildID);

    if (cmd == undefined) {
        return false;
    }

    for (const arg of args) {
        if (!isNaN(arg)) {
            if (arg.length > 15 && arg.length < 20) {
                await bot.getRESTUser(arg).then(user => bot.users.add(user)).catch(() => { });
            }
        }
    }

    if (message.channel instanceof Eris.TextChannel) {
        if (message.channel.guild !== undefined) {
            if (bot.util.cache.getCache("loadedMembers", message.guildID, 0) != true) {
                const count = message.channel.guild.memberCount > 1000 ? 1000 : message.channel.guild.memberCount;
                const members = await bot.getRESTGuildMembers(message.channel.guild.id, count);
                for (const member of members) {
                    bot.users.add(member.user);
                    message.channel.guild.members.add(member);
                }
                bot.util.cache.addCache("loadedMembers", message.guildID, 0, true);
            }
        }
    }

    if (bot.awaitMessages != undefined
        && Array.isArray(bot.awaitMessages[message.channel.id])) {
        let output = true;
        for (const filter of bot.awaitMessages[message.channel.id]) {
            if (message && filter(message)) {
                output = false;
            }
        }
        if (output == false) {
            return false;
        }
    }

    const embed = {
        color: 0x2095AB,
        timestamp: new Date(),
        author: {
            name: message.author.username,
            icon_url: message.author.avatarURL
        },
        fields: []
    }

    if (!bot.util.rolecheck.checkTester(message.author)
        && !bot.util.rolecheck.checkStaff(message.author, "isTrialDeveloper")) {
        embed.fields.push({
            name: "Not Staff/Tester",
            value: "This bot is limited to **Forbidden Developers and Testers** only"
        });

        message.channel.createMessage({ embed: embed });
        return false;
    }

    const userBlocks = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0].blocks;
    if (userBlocks.commands == true
        && bot.clientOptions.owner !== message.author.id) {
        embed.fields.push({
            name: "Blocked",
            value: "You have been blocked from the bot entirely"
        });
        message.channel.createMessage({ embed: embed });
        return false;
    }

    const commandState = (await bot.provider.find("commands", { _id: cmd.name }, { limit: 1 }, true))[0];
    if (commandState.state === "broken") {
        embed.fields.push({
            name: "Broken Command",
            value: `Failed to execute **${cmd.name}** because it has been labelled as a broken command`
        });
        message.channel.createMessage({ embed: embed });
        return false;
    }
    if (commandState.state === "buggy") {
        message.channel.createMessage(
            `${message.author.mention}, **${cmd.name}** has been labelled as a buggy command. ` +
            `It may not work as intended.`
        );
    }

    if (message.guildID) {
        if (!message.channel.permissionsOf(bot.user.id).has("sendMessages")) {
            try {
                message.author.getDMChannel()
                    .then(chn => chn.createMessage(`${message.author.mention}, I can't send messages in that channel!`));
            } catch (err) {
                return false;
            }
            return false;
        }
        if (!message.channel.permissionsOf(bot.user.id).has("embedLinks")) {
            if (cmd.name !== "help") {
                message.channel.createMessage(
                    `${message.author.mention}, Unfortunately I do not have "EMBED LINKS" permission and I require it.\n` +
                    `Sorry for any inconvience this may cause you. Creating every command a text alternative is hard ` +
                    `and time consuming. I hope you can understand this. Thanks.`
                );
                return false;
            }
        }
    }

    // If this message fails in the DM then the bot can't message
    // Therefor the command will not execute
    try {
        if (message.channel.type == 1) {
            await message.author.getDMChannel()
                .then(chn => chn.createMessage("DM Command Executed"));
        }
    } catch (err) {
        return false;
    }
}