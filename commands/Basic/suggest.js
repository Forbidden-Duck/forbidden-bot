const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class Suggest extends Commando.Command {
    constructor(bot) {
        super(bot, "suggest", "basic", {
            description: "Leave a suggestion for the bot (No abuse)",
            usage: "suggest [Suggestion]"
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
            const suggestion = args.join(" ");

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
            if (userDB.blocks.suggest == true) {
                embed.description = `You've been blocked from using **${this.name}** command`;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const timeSinceUse = userDB.ratelimits.suggest || 0;
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

            if (!suggestion || suggestion.length <= 0) {
                embed.description = "You haven't entered anything to suggest";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (suggestion.length < 10) {
                embed.description = "You didn't provide enough detail in your suggestion";
                embed.fields = [
                    { name: "Validation", value: "At a minimum provide at least **10 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (suggestion.length > 150) {
                embed.description = "You provided too much detail!\nWe appreciate your support, but we wan to reduce/prevent spam";
                embed.fields = [
                    { name: "Validation", value: "At a maximum provide less than **150 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (["suggestion", "[suggestion]"].includes(suggestion.toLowerCase())) {
                embed.description = `You need to provide your suggestion not what the usage tells you`;
                embed.fields = [
                    {
                        name: "Validation",
                        value:
                            "Make sure to replace **[Suggestion]** with your suggestion\n" +
                            `**For example**: \`${prefix}${this.name} Could you add a Duck command?!\``
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            // #forbidden-suggestions
            const suggestChannel = bot.guilds.get("250486125431488512").channels.get("356698436503863296");
            const loadingCMD = await message.channel.createMessage("Sending Suggestion...");

            if (suggestChannel instanceof Eris.TextChannel) {
                try {
                    embed.fields = [
                        {
                            name: ":information_source: Information :information_source:",
                            value:
                                `*${message.guildID ? message.channel.guild.name : "DM"} ` +
                                `| ${bot.util.useful.getUserTag(message.author)} | ${message.author.id}*`
                        },
                        { name: "📥 Suggested 📥", value: suggestion }
                    ];
                    suggestChannel.createMessage({ embed: embed }).then(async (msg) => {
                        await msg.addReaction("✅");
                        await msg.addReaction("❎");
                    });
                } catch (err) {
                    embed.fields = [];
                    embed.description = "Failed to send your suggestion. Please try again later";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed });
                    return;
                }

                embed.fields = [];
                embed.description = "Your suggestion was sent! We appreciate your support.";
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });

                await bot.provider.update("users", { _id: message.author.id }, {
                    $set:
                        { "ratelimits.suggest": currentTime.add(30, "minutes").valueOf() }
                }, true);
            }
        }
    }
}