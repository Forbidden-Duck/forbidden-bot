const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");
const tokens = require("../../tokens.json");
const packages = require("../../package.json");

module.exports = class BotInfo extends Commando.Command {
    constructor(bot) {
        super(bot, "botinfo", "info", {
            description: "Display bot information from different sources",
            usage: "botinfo [Source]",
            aliases: ["bi", "info"]
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
            const sourceArg = args.join(" ");
            const forbiddenGuild = bot.guilds.get("250486125431488512");

            const sources = [
                { source: 0, aliases: ["", "bot"] },
                { source: 1, aliases: ["bfd", "bots for discord", "botsfordiscord"] },
                { source: 2, aliases: ["dbl", "discord bot list", "discordbotlist"] }
            ];

            let source = -1;
            if (sources.find(src => src.aliases.includes(sourceArg.toLowerCase())) != undefined) {
                source = sources.find(src => src.aliases.includes(sourceArg.toLowerCase())).source;
            } else if (sourceArg == undefined || sourceArg === "") {
                source = 0;
            }

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                thumbnail: {
                    url: bot.user.avatarURL
                },
                fields: []
            };

            if (sourceArg && sourceArg.length > 0 && source == -1) {
                embed.description = `**${sourceArg}** isn't an available source`;
                embed.fields = [
                    {
                        name: "Available Sources",
                        value:
                            "\`bot\` (or nothing) for normal bot information\n" +
                            "\`bfd\` for Bots for Discord information\n" +
                            "\`dbl\` for Discord Bot List information"
                    }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage("Loading Bot Information...");
            switch (source) {
                case 0:
                    const staffRoles = [
                        bot.util.data.getStaffRole("Manager").id,
                        bot.util.data.getStaffRole("Moderator").id
                    ];
                    const devRoles = [
                        bot.util.data.getStaffRole("Developer").id,
                        bot.util.data.getStaffRole("Trial Dev").id
                    ];

                    const donorRoles = bot.util.data.getDonorRoles().map(rle => rle.id);
                    const donorSize =
                        forbiddenGuild.members
                            .filter(mem => donorRoles.some(rle => mem.roles.includes(rle))).length;

                    const customPrefixCount =
                        Object.values(bot.guildPrefixes)
                            .filter(pref => pref !== bot.clientOptions.prefix).length;

                    const staffMembers = forbiddenGuild.members
                        .filter(mem => staffRoles.some(rle => mem.roles.includes(rle)))
                        .map(mem => bot.util.useful.getUserTag(mem.user)).join(", ");
                    const devMembers = forbiddenGuild.members
                        .filter(mem => devRoles.some(rle => mem.roles.includes(rle)))
                        .map(mem => bot.util.useful.getUserTag(mem.user)).join(", ");

                    const commandCount = await getCommandCount(bot);
                    const allCount = Object.values(bot.commands)
                        .filter(cmd =>
                            commandCount[cmd.name] != undefined &&
                            commandCount[cmd.name].bot > 0 &&
                            // @ts-ignore
                            !["staff", "founder"].includes(cmd.group.id))
                        .sort((a, b) => commandCount[b.name].bot - commandCount[a.name].bot);
                    const countObj = {
                        name: [],
                        count: []
                    };
                    for (let i = 0; i < 5; i++) {
                        countObj.name.push(allCount[i] ? allCount[i].name : "N/A");
                        countObj.count.push(allCount[i] ? commandCount[allCount[i].name].bot : "N/A");
                    }

                    let userCount = 0;
                    bot.guilds.forEach(guild => userCount += guild.memberCount);

                    embed.description =
                        `Type \`${prefix}${this.name} bfd\` for Bots for Discord\n` +
                        `Type \`${prefix}${this.name} dbl\` for Discord Bot List`;
                    embed.fields.push(
                        { name: "Creator", value: packages.author, inline: true },
                        { name: "Version", value: packages.version, inline: true },
                        { name: "Library", value: packages.library, inline: true },
                        { name: "Servers", value: bot.guilds.size, inline: true },
                        { name: "Users", value: userCount, inline: true },
                        { name: "Donators", value: donorSize, inline: true },
                        { name: "Default Prefix", value: bot.clientOptions.prefix, inline: true },
                        { name: "Total Custom Prefixs", value: customPrefixCount, inline: true },
                        { name: "Developers", value: devMembers || "N/A" },
                        { name: "Staff", value: staffMembers || "N/A" },
                        { name: "Favourite Commands", value: countObj.name.join("\n"), inline: true },
                        { name: "Uses", value: countObj.count.join("\n"), inline: true }
                    );
                    break;
                case 1: {
                    let body;
                    try {
                        const res = await superagent.get("https://botsfordiscord.com/api/bot/305203825931845632/")
                            .set("Content-Type", "application/json")
                            .set("Authorization", tokens.botlists.botsfordiscord);
                        body = res.body;
                    } catch (err) {
                        embed.description = "Unexpected Error";
                        embed.fields = [
                            { name: "Error", value: `\`\`\`${err}\`\`\`` }
                        ];
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    let linkArray = [];
                    if (body.invite && body.invite.length > 0) {
                        linkArray.push(`[Invite](${body.invite})`);
                    }
                    if (body.website && body.website.length > 0) {
                        linkArray.push(`[Website](${body.website})`);
                    }
                    if (body.github && body.github.length > 0) {
                        linkArray.push(`[Github](${body.github})`);
                    }
                    if (body.support_server && body.support_server.length > 0) {
                        linkArray.push(`[Support Server](${body.support_server})`);
                    }
                    linkArray.push(`[BFD Website](https://botsfordiscord.com/bot/${body.vanityUrl || "305203825931845632"})`);

                    embed.timestamp = new Date(body.approvalTime);
                    embed.description =
                        `Type \`${prefix}${this.name}\` for Normal Bot Information\n` +
                        `Type \`${prefix}${this.name} dbl\` for Discord Bot List`;
                    embed.title = "Bots for Discord | Bot Information";
                    embed.fields.push(
                        { name: "Name", value: `${body.tag}${body.verified ? "<:bfdverf:507354422268002304>" : ""}`, inline: true },
                        { name: "ID", value: body.id, inline: true },
                        { name: "Library", value: body.library, inline: true },
                        { name: "Prefix", value: body.prefix, inline: true },
                        { name: "Server Count", value: body.server_count, inline: true },
                        { name: "Tags", value: body.tags ? body.tags.join(", ") : "N/A", inline: true },
                        { name: "Featured", value: body.featured, inline: true },
                        { name: "Vanity", value: body.vanityUrl || "N/A", inline: true },
                        { name: "Votes", value: body.votes, inline: true },
                        { name: "Short Description", value: body.short_desc },
                        {
                            name: "Owners",
                            value:
                                `${bot.util.useful.getUserTag(body.owner)}, ` +
                                `${body.owners.map(user => bot.users.has(user)
                                    ? bot.util.useful.getUserTag(user)
                                    : `${user} (Couldn't Find User)`).join(", ")}`
                        },
                        { name: "Links", value: linkArray.join(" | ") }
                    );
                    break;
                }
                case 2: {
                    let body;
                    try {
                        const res = await superagent.get("https://top.gg/api/bots/305203825931845632/")
                            .set("Content-Type", "application/json")
                            .set("Authorization", tokens.botlists.discordbotlist);
                        body = res.body;
                    } catch (err) {
                        embed.description = "Unexpected Error";
                        embed.fields = [
                            { name: "Error", value: `\`\`\`${err}\`\`\`` }
                        ];
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                        return;
                    }

                    let linkArray = [];
                    if (body.invite && body.invite.length > 0) {
                        linkArray.push(`[Invite](${body.invite})`);
                    }
                    if (body.website && body.website.length > 0) {
                        linkArray.push(`[Website](${body.website})`);
                    }
                    if (body.github && body.github.length > 0) {
                        linkArray.push(`[Github](${body.github})`);
                    }
                    if (body.support && body.support.length > 0) {
                        linkArray.push(`[Support Server](https://discord.gg/${body.support})`);
                    }
                    linkArray.push(`[DBL Website](https://top.gg/bot/${body.vanityUrl || "305203825931845632"})`);

                    embed.timestamp = new Date(body.date);
                    embed.description =
                        `Type \`${prefix}${this.name}\` for Normal Bot Information\n` +
                        `Type \`${prefix}${this.name} bfd\` for Bots for Discord`;
                    embed.fields.push(
                        {
                            name: "Name",
                            value: `${body.username}#${body.discriminator}${body.certifiedBot ? "<:dblcert:505586907011350538>" : ""}`,
                            inline: true
                        },
                        { name: "ID", value: body.id, inline: true },
                        { name: "Library", value: body.lib, inline: true },
                        { name: "Prefix", value: body.prefix, inline: true },
                        { name: "Server Count", value: body.server_count, inline: true },
                        { name: "Shard Count", value: body.shards.length, inline: true },
                        { name: "Tags", value: body.tags ? body.tags.join(", ") : "N/A", inline: true },
                        { name: "Vanity", value: body.vanityUrl || "N/A", inline: true },
                        { name: "Votes", value: body.points, inline: true },
                        { name: "Short Description", value: body.shortdesc },
                        {
                            name: "Owners",
                            value:
                                body.owners.map(user => bot.users.has(user)
                                    ? bot.util.useful.getUserTag(user)
                                    : `${user} (Couldn't Find User)`).join(", ")
                        },
                        { name: "Links", value: linkArray.join(" | ") }
                    );
                    break;
                }
                default:
                    embed.description = "Oh um... this is awkward";
                    loadingCMD.delete();
                    message.channel.createMessage({ embed: embed });
                    return;
            }
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }

        /**
         * @param {Commando.CommandClient} bot
        */
        async function getCommandCount(bot) {
            const commands = await bot.provider.find("commands", {}, {}, true);
            const commandsObj = {};
            for (const command of commands) {
                commandsObj[command._id] = command.count;
            }
            return commandsObj;
        }
    }
}