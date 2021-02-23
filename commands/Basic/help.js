const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Help extends Commando.Command {
    constructor(bot) {
        super(bot, "help", "basic", {
            aliases: ["commands"],
            description: "Provides information on all categories and commands",
            usage: "help [Category] [Sub-Category]"
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

            const grpCMD = args[0];
            const childGrp = args[1];

            const parentGroups = Object.values(bot.groups).filter(grp => grp.isParent);
            const normalGroups = Object.values(bot.groups).filter(grp => !grp.isParent && grp.parent == undefined);
            const commands = Object.values(bot.commands);

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            const loadingCMD = await message.channel.createMessage("Loading Help Menu...");
            if (!grpCMD || grpCMD.length <= 0) {
                embed.fields = [
                    { name: "Information", value: `Remember to do **${prefix}${this.name} [Category]**` },
                    { name: "Categories", value: normalGroups.map(grp => grp.name).join("\n") || "None", inline: true },
                    { name: "Statistics", value: parentGroups.map(grp => grp.name).join("\n") || "None", inline: true }
                ];
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            } else if (parentGroups.map(grp => grp.name.toLowerCase()).includes(grpCMD.toLowerCase())) {
                const parent = parentGroups.find(grp => grp.name.toLowerCase() === grpCMD.toLowerCase());
                if (parent instanceof Commando.ParentGroup) {
                    const groups = Object.values(parent.groups);
                    if (childGrp && childGrp.length > 0) {
                        if (groups.map(grp => grp.name.toLowerCase()).includes(childGrp.toLowerCase())) {
                            const group = groups.find(grp => grp.name.toLowerCase() === childGrp.toLowerCase());
                            const commands = Object.values(group.commands);
                            embed.fields = [
                                { name: "Information", value: `Remember to do **${prefix}${this.name} [Command]**` },
                                {
                                    name: "Commands",
                                    value: commands.map(cmd => `**${cmd.name}** - \`${cmd.description || "No description"}\``)
                                        .join("\n") || "None"
                                }
                            ];
                            loadingCMD.delete();
                            message.channel.createMessage({ embed: embed });
                        } else {
                            const secondaryEmbed = Object.assign({}, embed);
                            embed.fields = [
                                { name: "Information", value: `Remember to do **${prefix}${this.name} ${grpCMD} [Group]**` },
                                { name: "Sub-Categories", value: groups.map(grp => grp.name).join("\n") || "None" },
                            ];

                            delete secondaryEmbed.author;
                            delete secondaryEmbed.timestamp;
                            secondaryEmbed.description = `\`${childGrp}\` isn't a Sub-Category of ${parent.name}`;

                            loadingCMD.delete();
                            await message.channel.createMessage({ embed: embed });
                            message.channel.createMessage({ embed: secondaryEmbed });
                        }
                    } else {
                        embed.fields = [
                            { name: "Information", value: `Remember to do **${prefix}${this.name} ${grpCMD} [Group]**` },
                            { name: "Sub-Categories", value: groups.map(grp => grp.name).join("\n") || "None" }
                        ];
                        loadingCMD.delete();
                        message.channel.createMessage({ embed: embed });
                    }
                }
            } else if (normalGroups.map(grp => grp.name.toLowerCase()).includes(grpCMD.toLowerCase())) {
                const group = normalGroups.find(grp => grp.name.toLowerCase() === grpCMD.toLowerCase());
                const commands = Object.values(group.commands);
                embed.fields = [
                    { name: "Information", value: `Remember to do **${prefix}${this.name} [Command]**` },
                    {
                        name: "Commands",
                        value: commands.map(cmd => `**${cmd.name}** - \`${cmd.description || "No description"}\``)
                            .join("\n") || "None"
                    }
                ];
                loadingCMD.delete();
                message.channel.createMessage({ embed: embed });
            } else if (commands.map(cmd => cmd.name).includes(grpCMD.toLowerCase())) {
                const command = commands.find(cmd => cmd.name === grpCMD.toLowerCase());
                loadingCMD.delete();
                message.content = `${prefix}usage ${command.name}`;
                bot.commands.usage.process([command.name], message);
            } else {
                const secondaryEmbed = Object.assign({}, embed);
                embed.fields = [
                    { name: "Information", value: `Remember to do **${prefix}${this.name} [Category]**` },
                    { name: "Categories", value: normalGroups.map(grp => grp.name).join("\n") || "None", inline: true },
                    { name: "Statistics", value: parentGroups.map(grp => grp.name).join("\n") || "None", inline: true }
                ];

                delete secondaryEmbed.author;
                delete secondaryEmbed.timestamp;
                secondaryEmbed.description = `\`${grpCMD}\` isn't a Category or Command`;

                loadingCMD.delete();
                await message.channel.createMessage({ embed: embed });
                message.channel.createMessage({ embed: secondaryEmbed });
            }
        }
    }
}