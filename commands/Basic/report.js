const Eris = require("eris");
const Commando = require("eris.js-commando");
const moment = require("moment");

module.exports = class Report extends Commando.Command {
    constructor(bot) {
        super(bot, "report", "basic", {
            description: "Send a report to the staff team (No abuse)",
            usage: "report [Report]"
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
            const report = args.join(" ");

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
            if (userDB.blocks.report == true) {
                embed.description = `You've been blocked from using **${this.name}** command`;
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            const timeSinceUse = userDB.ratelimits.report || 0;
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

            if (!report || report.length <= 0) {
                embed.description = "You haven't entered anything to report";
                embed.fields = [
                    { name: "Usage", value: `\`${prefix}${this.usage}\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (report.length < 10) {
                embed.description = "You didn't provide enough detail in your report";
                embed.fields = [
                    { name: "Validation", value: "At a minimum provide at least **10 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (report.length > 300) {
                embed.description = "You provided too much detail!\nWe appreciate your support, but we wan to reduce/prevent spam";
                embed.fields = [
                    { name: "Validation", value: "At a maximum provide less than **300 characters**" }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (["report", "[report]"].includes(report.toLowerCase())) {
                embed.description = `You need to provide your report not what the usage tells you`;
                embed.fields = [
                    {
                        name: "Validation",
                        value:
                            "Make sure to replace **[Report]** with your report\n" +
                            `**For example**: \`${prefix}${this.name} Duck is being mean to me \:(\``
                    }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            // #bot-reports
            const reportChannel = bot.guilds.get("250486125431488512").channels.get("425525256036417546");
            const loadingCMD = await message.channel.createMessage("Sending Report...");

            if (reportChannel instanceof Eris.TextChannel) {
                try {
                    embed.fields = [
                        {
                            name: ":information_source: Information :information_source:",
                            value:
                                `*${message.guildID ? message.channel.guild.name : "DM"} ` +
                                `| ${bot.util.useful.getUserTag(message.author)} | ${message.author.id}*`
                        },
                        { name: "Report Message", value: report }
                    ];
                    reportChannel.createMessage({
                        content: ":inbox_tray: **Incoming Report** :inbox_tray:",
                        embed: embed
                    });
                } catch (err) {
                    embed.fields = [];
                    embed.description = "Failed to send your report. Please try again later";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed });
                    return;
                }
                embed.fields = [];
                embed.description = "Your report was sent! We appreciate your support.";
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });

                await bot.provider.update("users", { _id: message.author.id }, {
                    $set:
                        { "ratelimits.report": currentTime.add(30, "minutes").valueOf() }
                }, true);
            }
        }
    }
}