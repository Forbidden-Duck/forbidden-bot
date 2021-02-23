const Eris = require("eris");
const Commando = require("eris.js-commando");
const superagent = require("superagent");
const moment = require("moment");
const tokens = require("../../../tokens.json");

module.exports = class LolChamp extends Commando.Command {
    constructor(bot) {
        super(bot, "lolchamp", "lol", {
            description: "Display league-specific champion information (not player-based)",
            usage: "lolchamp [Champion]",
            aliases: ["lolchampion", "lolchamps", "lolchampions"]
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
            const champArg = args.join(" ");

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkDonor(message.author, "is$5")
                && !bot.util.rolecheck.checkStaff(message.author, "isModerator")) {
                embed.description = "You must be a Donator to use this command";
                embed.fields = [
                    { name: "Donate today!", value: `\`${prefix}donate\`` }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }

            let versions;
            let championsList;
            try {
                versions = await superagent.get("https://ddragon.leagueoflegends.com/api/versions.json")
                    .then(res => res.body);

                if (bot.util.cache.getCache("gameLOLCHAMPIONS", versions[0], 0) == undefined) {
                    championsList = await superagent.get(`http://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`)
                        .then(res => res.body.data);
                } else {
                    championsList = bot.util.cache.getCache("gameLOLCHAMPIONS", versions[0], 0)
                }
            } catch (err) {
                embed.description = "Failed to grab the list of all available champions";
                embed.fields = [
                    { name: "Error", value: err }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            bot.util.cache.addCache("gameLOLCHAMPIONS", versions[0], 0, championsList);

            const champKeys = Object.values(championsList).map(key => key.id.toLowerCase());
            if ((champArg == undefined || !champKeys.includes(champArg.toLowerCase()))
                || champArg.toLowerCase() === "champions") {
                let champsArr = [[], [], []];
                let rowIndex = 0;
                for (const champ in championsList) {
                    const champName = championsList[champ].id;
                    champsArr[rowIndex].push(champName);
                    rowIndex++;
                    if (rowIndex >= 3) {
                        rowIndex = 0;
                    }
                }

                embed.description =
                    "For a more detailed list visit https://na.leagueoflegends.com/en-us/champions/\n" +
                    `${champArg == undefined || champArg === "" || champArg.toLowerCase() === "champions"
                        ? ""
                        : `**${champArg}** is an invalid champion`}`;
                embed.fields = [
                    { name: "Champions List", value: champsArr[0].join(", "), inline: true },
                    { name: "\u200b", value: champsArr[1].join(", "), inline: true },
                    { name: "\u200b", value: champsArr[2].join(", "), inline: true }
                ];
                delete embed.timestamp;
                message.channel.createMessage({ embed: embed });
                return;
            }
            const champ = Object.values(championsList).find(chmp => chmp.id.toLowerCase() === champArg.toLowerCase());
            const loadingCMD = await message.channel.createMessage(`Loading Statistics for **${champ.name}**`);

            embed.title = champ.title;
            embed.description = champ.blurb;
            embed.thumbnail = {
                url: `http://ddragon.leagueoflegends.com/cdn/10.16.1/img/champion/${champ.image.full}`
            };
            embed.fields = [
                { name: "Name", value: champ.name, inline: true },
                { name: "Partype", value: champ.partype, inline: true },
                { name: "Tags", value: champ.tags.join(", "), inline: true },

                {
                    name: "Health",
                    value:
                        `**HP**: ${champ.stats.hp}\n` +
                        `**HP / LvL**: ${champ.stats.hpperlevel}\n` +
                        `**HP Regen**: ${champ.stats.hpregen}\n` +
                        `**HP Regen / LvL**: ${champ.stats.hpregenperlevel}`,
                    inline: true
                },
                {
                    name: "Mana",
                    value:
                        `**MP**: ${champ.stats.mp}\n` +
                        `**MP / LvL**: ${champ.stats.mpperlevel}\n` +
                        `**MP Regen**: ${champ.stats.mpregen}\n` +
                        `**MP Regen / LvL**: ${champ.stats.mpregenperlevel}\n`,
                    inline: true
                },
                {
                    name: "Armour",
                    value:
                        `**Armour**: ${champ.stats.armor}\n` +
                        `**Armour / LvL**: ${champ.stats.armorperlevel}`,
                    inline: true
                },

                {
                    name: "Attack",
                    value:
                        `**Attack Range**: ${champ.stats.attackrange}\n` +
                        `**Damage**: ${champ.stats.attackdamage}\n` +
                        `**Damage / LvL**: ${champ.stats.attackdamageperlevel}\n` +
                        `**Attack Speed**: ${champ.stats.attackspeed}\n` +
                        `**Attack Speed / LvL**: ${champ.stats.attackspeedperlevel}`,
                    inline: true
                },
                {
                    name: "Crit",
                    value:
                        `**Crit**: ${champ.stats.crit}\n` +
                        `**Crit / LvL**: ${champ.stats.critperlevel}\n`,
                    inline: true
                },
                {
                    name: "Spellblock",
                    value:
                        `**Spellblock**: ${champ.stats.spellblock}\n` +
                        `**Spellblock / LvL**: ${champ.stats.spellblockperlevel}`,
                    inline: true
                },

                {
                    name: "Overall",
                    value:
                        `**Attack**: ${champ.info.attack}\n` +
                        `**Defence**: ${champ.info.defense}\n` +
                        `**Magic**: ${champ.info.magic}\n` +
                        `**Difficulty**: ${champ.info.difficulty}\n` +
                        `**Move Speed**: ${champ.stats.movespeed}`
                },
            ];
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }
    }
}