const Eris = require("eris");
const Commando = require("eris.js-commando");

module.exports = class BugCmd extends Commando.Command {
    constructor(bot) {
        super(bot, "bugcmd", "staff", {
            description: "Set the state of a command DEVELOPER+ ONLY",
            usage: "bugcmd [Option] [Command] [-Param]"
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
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL
                },
                fields: []
            };

            if (!bot.util.rolecheck.checkStaff(message.author, "isDeveloper")) {
                embed.description = "You must be Forbidden Developer+ to use this command";
                message.channel.createMessage({ embed: embed });
                return;
            }

            let optCmd = args[0];
            let cmdOpt = args.slice(1).join(" ");
            const param = args.join(" ").match(paramRegex) ? args.join(" ").match(paramRegex)[0].replace(/-{1,2}/gm, "").trim() : "";

            const options = ["buggy", "broken"];
            const params = ["status", "options", "params"];

            let cmd;
            let option;

            if (cmdOpt && cmdOpt.length > 0) {
                cmdOpt = cmdOpt.replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
                const parsedCMD = findCMD(bot, cmdOpt);
                const parsedOption = findOption(options, cmdOpt);
                if (parsedCMD instanceof Commando.Command) {
                    cmd = parsedCMD;
                    cmdOpt = "command";
                } else if (typeof parsedOption === "string") {
                    option = parsedOption;
                    cmdOpt = "option";
                }
            }
            if (optCmd && optCmd.length > 0) {
                optCmd = optCmd.replace(/^[-]{1,2}[a-zA-Z]*$/m, "");
                const parsedCMD = findCMD(bot, optCmd);
                const parsedOption = findOption(options, optCmd);
                if (parsedCMD instanceof Commando.Command) {
                    cmd = parsedCMD;
                    optCmd = "command";
                } else if (typeof parsedOption === "string") {
                    option = parsedOption;
                    optCmd = "option";
                }
            }

            if (param.toLowerCase() === "params") {
                params.forEach(curParam => {
                    embed.fields.push({
                        name: curParam,
                        value:
                            `${prefix}${this.name} ${option ? option + " " : ""}-${curParam}`
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
                            `${prefix}${this.name} ${curOption} [Command]`
                    });
                });
                message.channel.createMessage({ embed: embed });
                return;
            }
            const cmdState = await getCommandStates(bot);
            if (param.toLowerCase() === "status") {
                options.forEach(curOption => {
                    embed.fields.push({
                        name: curOption, value: cmdState[curOption].join(", ") || "None"
                    });
                });
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (!optCmd || optCmd.length <= 0) {
                embed.description = "You need to enter at least something...";
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (cmd == undefined || !(cmd instanceof Commando.Command)) {
                if ((cmdOpt !== "command" && cmdOpt !== "option" && (cmdOpt && cmdOpt.length > 0))
                    || (optCmd !== "command" && optCmd !== "option" && (optCmd && optCmd.length > 0))) {
                    embed.description =
                        `**${cmdOpt !== "command" && cmdOpt !== "option" && (cmdOpt && cmdOpt.length > 0) ? cmdOpt : optCmd}** isn't a valid command`;
                } else {
                    embed.description = "You need to enter a command";
                }
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            if (option == undefined || typeof option !== "string") {
                if ((cmdOpt !== "command" && cmdOpt !== "option" && (cmdOpt && cmdOpt.length > 0))
                    || (optCmd !== "command" && optCmd !== "option" && (optCmd && optCmd.length > 0))) {
                    embed.description =
                        `**${cmdOpt !== "command" && cmdOpt !== "option" && (cmdOpt && cmdOpt.length > 0) ? cmdOpt : optCmd}** isn't a valid option`;
                } else {
                    embed.description = "You need to enter a option";
                }
                embed.fields = [
                    { name: "Usage", value: `${prefix}${this.usage}` }
                ];
                message.channel.createMessage({ embed: embed });
                return;
            }

            const loadingCMD = await message.channel.createMessage(`Toggling **${cmd.name}** from **${option}**...`);

            const outcome =
                cmdState[option] != undefined && cmdState[option].includes(cmd.name)
                    ? "Removed" : "Added";

            if (outcome === "Removed") {
                bot.provider.update("commands", { _id: cmd.name }, { $unset: { state: "" } }, true);
                cmdState[option].splice(cmdState[option].indexOf(cmd.name), 1);
            } else {
                bot.provider.update("commands", { _id: cmd.name }, { $set: { state: option } }, true);
                cmdState[option].push(cmd.name);
            }

            embed.description = `${outcome} **${cmd.name}** ${outcome === "Removed" ? "from" : "to"} **${option}**`;
            loadingCMD.delete();
            message.channel.createMessage({ embed: embed });
        }

        /** 
         * @param {Commando.CommandClient} bot 
         * @param {String} arg 
         * @returns {Commando.Command | void}
        */
        function findCMD(bot, arg) {
            return bot.util.parse.cmdParse({
                arg: arg
            });
        }

        /** 
         * @param {Array<String>} options 
         * @param {String} arg 
         * @returns {String}
        */
        function findOption(options, arg) {
            return arg && options.find(option => option === arg.toLowerCase());
        }

        /**
         * @param {Commando.CommandClient} bot
        */
        async function getCommandStates(bot) {
            const commands = await bot.provider.find("commands", {}, {}, true);
            const commandStates = {
                buggy: [],
                broken: []
            };
            for (const command of commands) {
                switch (command.state) {
                    case "buggy":
                        commandStates.buggy.push(command._id);
                        break;
                    case "broken":
                        commandStates.broken.push(command._id);
                        break;
                }
            }
            return commandStates;
        }
    }
}