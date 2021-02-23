"use strict";

const Eris = require("eris");
const Commando = require("eris.js-commando");
const os = require("os");
const packages = require("../../package.json");

module.exports = class SysInfo extends Commando.Command {
    constructor(bot) {
        super(bot, "sysinfo", "info", {
            description: "Display the bot's current system information",
            usage: "sysinfo"
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
            const loadingCMD = await message.channel.createMessage("Loading system information");

            let apiPing = 0;
            if (message.channel instanceof Eris.TextChannel) {
                apiPing = Math.trunc(message.channel.guild.shard.latency);
            } else {
                apiPing = Math.trunc(bot.shards.get(0).latency);
            }

            const seconds = Math.floor((bot.uptime / 1000) % 60);
            const minutes = Math.floor((bot.uptime / 60000) % 60);
            const hours = Math.floor((bot.uptime / 3600000) % 24);
            const days = Math.floor((bot.uptime / 3600000 / 24));

            let uptime;
            if (days >= 1) {
                uptime = `${days}**d** : ${hours}**h** : ${minutes}**m** : ${seconds}**s**`
            } else if (hours >= 1) {
                uptime = `${hours}**h** : ${minutes}**m** : ${seconds}**s**`
            } else if (minutes >= 1) {
                uptime = `${minutes}**m** : ${seconds}**s**`
            } else {
                uptime = `${seconds}**s**`
            }

            loadingCMD.delete();
            message.channel.createMessage({
                embed: {
                    color: 0x2095AB,
                    timestamp: new Date(),
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL
                    },
                    fields: [
                        { name: "Operating System", value: `${os.platform} ${os.release}`, inline: true },
                        // Add a empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        { name: "CPU Model", value: os.cpus()[0].model, inline: true },
                        { name: "NodeJS Version", value: process.version, inline: true },
                        // Add a empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        { name: "Eris Version", value: packages.dependencies["eris"].replace("^", "v"), inline: true },
                        { name: "Ping", value: `${apiPing}ms`, inline: true },
                        // Add a empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        { name: "Uptime", value: uptime, inline: true },
                        { name: "Memory Used", value: `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MegaBytes`, inline: true },
                        // Add a empty field
                        { name: "\u200b", value: "\u200b", inline: true },
                        { name: "Memory Total", value: `${(+os.totalmem / 1073741824).toFixed(2)} GigaBytes`, inline: true },
                    ]
                }
            });
        }
    }
}