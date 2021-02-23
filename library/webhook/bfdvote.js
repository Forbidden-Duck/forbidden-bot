const Commando = require("eris.js-commando");

/** 
 * @param {Commando.CommandClient} bot 
 * @param {*} data 
*/
module.exports = async (bot, data) => {
    const voteLog = bot.guilds.get("250486125431488512").channels.get("710050939125497916");

    if (data) {
        try {
            data = JSON.parse(data);
        } catch (err) {
            bot.Logger.error("BFD Vote : Failed to parse");
        }

        let user = bot.users.get(data.user)
            || await bot.getRESTUser(data.user).then(usr => bot.users.add(usr)).catch(() => { });
        // Start loading
        // @ts-ignore
        let loadingVote = await voteLog.createMessage("New vote loading...");

        // Don't store test votes
        if (data.type !== "test") {
            // Increment votes
            if (user) {
                await bot.provider.update("users", { _id: bot.user.id }, {
                    $inc: {
                        "bfd.votes": 1,
                        ["bfd." + user.id]: 1,
                        total: 1
                    }
                }, true);
            } else {
                await bot.provider.update("users", { _id: bot.user.id }, {
                    $inc: {
                        "bfd.votes": 1,
                        total: 1
                    }
                }, true);
            }
            const userVotes = (await bot.provider.find("users", { _id: bot.user.id }, { limit: 1 }))[0]
                || { bfd: { votes: 0 }, dbl: { votes: 0 }, total: 0 };

            const embed = {
                color: 0x2095AB,
                timestamp: new Date(),
                author: {
                    name: user ? user.username : "Invalid User",
                    icon_url: user ? user.avatarURL : bot.user.avatarURL
                },
                fields: [
                    { name: "DBL Votes", value: userVotes.dbl ? userVotes.dbl.votes : 0, inline: true },
                    { name: "BFD Votes", value: userVotes.bfd ? userVotes.bfd.votes : 0, inline: true },
                    { name: "Total Votes", value: userVotes.total || 0, inline: true },
                    {
                        name: "User",
                        value: user && bot.util.useful.getUserTag(user)
                            ? bot.util.useful.getUserTag(user)
                            : "Invalid User",
                        inline: true
                    },
                    { name: "Website", value: "Bots for Discord" },
                    { name: "Type", value: data.type }
                ]
            }

            loadingVote.edit({ content: "", embed: embed });
            bot.Logger.log("none", `&-3BFD Vote&r : ${userVotes.bfd.votes || 0}`);
        }
    } else {
        bot.Logger.error("BFD Vote: Invalid Data");
    }
}