const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class Block extends Commando.Command {
    constructor(bot) {
        super(bot, "block", "staff", {
            description: "Block a user from various options MANAGER+ ONLY",
            usage: "block [Option] [User] [-Param]"
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
            const paramRegex = /[ ]-{1,2}[a-zA-Z]*/m;

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isManager")) {
                embed.description = "You must be Forbidden Manager+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            let optUsr = args[0];
            let usrOpt = args.slice(1).join(" ");
            const param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";

            const options = ["commands", "suggest", "report", "feedback", "account"];
            const params = ["status", "options", "params"];

            let user;
            let option;

            if (usrOpt && usrOpt.length > 0) {
                usrOpt = usrOpt.replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
                const parsedUser = findUser(bot, usrOpt);
                const parsedOption = findOption(options, usrOpt);
                if (parsedUser instanceof Eris.User) {
                    user = parsedUser;
                    if (usrOpt.replace(/<@!/g, "<@") === user.mention) {
                        usrOpt = "mention";
                    } else if (typeof parsedOption === "string") {
                        option = parsedOption;
                        usrOpt = "option";
                    } else if (bot.util.parse.userParse({ arg: usrOpt }, { id: true, tag: true })) {
                        usrOpt = "user";
                    }
                } else if (typeof parsedOption === "string") {
                    option = parsedOption;
                    usrOpt = "option";
                }
            }
            if (optUsr && optUsr.length > 0) {
                optUsr = optUsr.replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
                const parsedUser = usrOpt !== "mention" && findUser(bot, optUsr);
                const parsedOption = findOption(options, optUsr);
                if (parsedUser instanceof Eris.User) {
                    user = parsedUser;
                    optUsr = "user";
                } else if (typeof parsedOption === "string") {
                    option = parsedOption;
                    optUsr = "option";
                }
            }
            usrOpt = usrOpt === "mention" ? "user" : usrOpt;

            if (param.toLowerCase() === "params") {
                params.forEach(curParam => {
                    embed.fields.push({
                        name: curParam,
                        value:
                            `${prefix}${this.name} ${option ? option + " " : ""}${curParam === "status" ? "[User] " : ""}-${curParam}`
                    });
                });
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (param.toLowerCase() === "options") {
                options.forEach(curOption => {
                    embed.fields.push({
                        name: curOption,
                        value:
                            `${prefix}${this.name} ${curOption} [User]`
                    });
                });
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (!usrOpt || usrOpt.length <= 0) {
                embed.description = "You need to enter at least something...";
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (user == undefined || !(user instanceof Eris.User)) {
                if ((usrOpt !== "user" && usrOpt !== "option")
                    || (optUsr !== "user" && optUsr !== "option")) {
                    embed.description = `**${usrOpt !== "user" && usrOpt !== "option" ? usrOpt : optUsr}** isn't a valid user`;
                } else {
                    embed.description = "You need to enter a user";
                }
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }
            if (user.bot) {
                embed.description = "You can't block bots!";
                message.channel.createMessage({ embed: embed });
                return;
            }

            embed.author = {
                name: user.username,
                icon_url: user.avatarURL
            }
            const userBlocks = (await bot.provider.find("users", { _id: user.id }, { limit: 1 }, true))[0].blocks;
            if (param.toLowerCase() === "status") {
                options.forEach(curOption => {
                    embed.fields.push({
                        name: curOption, value: !!userBlocks[curOption]
                    });
                });
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (option == undefined || typeof option !== "string") {
                if ((usrOpt !== "user" && usrOpt !== "option")
                    || (optUsr !== "user" && optUsr !== "option")) {
                    embed.description = `**${usrOpt !== "user" && usrOpt !== "option" ? usrOpt : optUsr}** isn't a valid option`;
                } else {
                    embed.description = "You need to enter a option";
                }
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD =
                await message.channel.createMessage(`Blocking/Unblocking **${bot.util.useful.getUserTag(user)}** from \`${option}\`...`);

            const old = new Boolean(!!userBlocks[option]);
            const outcome = old == true ? false : true;
            userBlocks[option] = outcome;
            bot.provider.update("users", { _id: user.id }, { $set: { ["blocks." + option]: outcome } }, true);

            embed.description = `Updated **${option}** from \`${old}\` to \`${outcome}\``;
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });

            const sendingCMD = await message.channel.createMessage(`Sending DM to **${bot.util.useful.getUserTag(user)}**`);
            try {
                await user.getDMChannel()
                    .then(chn => {
                        embed.title = `You have been ${outcome == true ? "Blocked" : "Unblocked"}`;
                        embed.fields = [
                            { name: "Staff Member", value: bot.util.useful.getUserTag(message.author) }
                        ];
                        chn.createMessage({ embed: embed });
                    });
            } catch (err) {
                sendingCMD.edit(`Can't send messages to **${bot.util.useful.getUserTag(user)}**`);
                return;
            }
            sendingCMD.edit("User has been notified");
        }

        /**
         * @param {Commando.CommandClient} bot
         * @param {String} arg
         * @returns {Eris.User | void} 
        */
        function findUser(bot, arg) {
            return bot.util.parse.userParse({
                mentions: message.mentions,
                arg: arg
            }, { id: true, tag: true, mention: true });
        }

        /** 
         * @param {Array<String>} options 
         * @param {String} arg 
         * @returns {String}
        */
        function findOption(options, arg) {
            return arg && options.find(option => option === arg.toLowerCase());
        }
    }
}