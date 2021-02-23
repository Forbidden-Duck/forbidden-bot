const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class Feedback extends Commando.Command {
    constructor(bot) {
        super(bot, "feedback", "basic", {
            description: "Send us some feedback about the bot (No abuse)",
            usage: "feedback [Feedback]"
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
            const feedback = args.join(" ");

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const userDB = (await bot.provider.find("users", { _id: message.author.id }, { limit: 1 }, true))[0];
            if (userDB.blocks.feedback == true) {
                embed.description = `You've been blocked from using **${this.name}** command`;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const timeSinceUse = userDB.ratelimits.feedback || 0;
            const currentTime = moment();
            if (!bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                if (timeSinceUse > currentTime.valueOf()) {
                    embed.description = `**${this.name}** is on cooldown to prevent spam`;
                    embed.fields = [
                        { name: "Ratelimit", value: "You have to wait **30 minutes** per your last use" }
                    ];
                    delete embed.timestamp;
                    message.channel.createMessage({ embed: embed });
                    return;
                }
            }

            if (!feedback || feedback.length <= 0) {
                embed.description = "You haven't entered anything to feedback";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (feedback.length < 10) {
                embed.description = "You didn't provide enough detail in your feedback";
                embed.fields = [
                    { name: "Validation", value: "At a minimum provide at least **10 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (feedback.length > 150) {
                embed.description = "You provided too much detail!\nWe appreciate your support, but we wan to reduce/prevent spam";
                embed.fields = [
                    { name: "Validation", value: "At a maximum provide less than **150 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (["feedback", "[feedback]"].includes(feedback.toLowerCase())) {
                embed.description = `You need to provide your feedback not what the usage tells you`;
                embed.fields = [
                    {
                        name: "Validation",
                        value:
                            "Make sure to replace **[Feedback]** with your feedback\n" +
                            `**For example**: \`${prefix}${this.name} This bot is super good, I love it!\``
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            // #feedback
            const feedbackChannel = bot.guilds.get("250486125431488512").channels.get("386493116292792341");
            const loadingCMD = await message.channel.createMessage("Sending Feedback...");

            let nickname = message.author.username;
            if (message.guildID != undefined
                && message.member.nick) {
                nickname = message.member.nick;
            }

            if (feedbackChannel instanceof Eris.TextChannel) {
                let webhooks = await feedbackChannel.getWebhooks();
                let webhookFound = false;

                for (const webhook of webhooks) {
                    if (webhook.name === bot.user.username) {
                        webhookFound = true;
                        await bot.executeWebhook(webhook.id, webhook.token, {
                            content: feedback,
                            username: nickname,
                            avatarURL: message.author.avatarURL
                        });

                        const dataURI = await bot.util.conversion.imageToBase64DataUri(bot.user.avatarURL);
                        bot.editWebhook(webhook.id, {
                            name: bot.user.username,
                            avatar: dataURI
                        }, webhook.token, "Webhook for Feedback");
                    }
                }

                if (webhookFound == false) {
                    const dataURI = await bot.util.conversion.imageToBase64DataUri(bot.user.avatarURL);
                    const webhook = await feedbackChannel.createWebhook({
                        name: bot.user.username,
                        avatar: dataURI
                    }, "Webhook for Feedback");
                    await bot.executeWebhook(webhook.id, webhook.token, {
                        content: feedback,
                        username: nickname,
                        avatarURL: message.author.avatarURL
                    });
                }

                embed.description = "Your feedback was sent! We appreciate your support";
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });

                await bot.provider.update("users", { _id: message.author.id }, {
                    $set:
                        { "ratelimits.feedback": currentTime.add(30, "minutes").valueOf() }
                }, true);
            }
        }
    }
}