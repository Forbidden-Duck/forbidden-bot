const Commando = require("eris.js-commando");
const Account = require("./functions/account");
const Cache = require("./functions/cache");
const Data = require("./functions/data");
const RoleCheck = require("./functions/rolecheck");
const Crypto = require("./functions/crypto");

/**
 * Load Utils onto <CommandClient>.util
 * @param {Commando.CommandClient} bot 
*/
module.exports = bot => {
    if (!bot.util.checkProps("account")) {
        bot.util.account = Account;
    }
    if (!bot.util.checkProps("cache")) {
        bot.util.cache = Cache;
    }
    if (!bot.util.checkProps("data")) {
        bot.util.data = Data;
    }
    if (!bot.util.checkProps("rolecheck")) {
        bot.util.rolecheck = RoleCheck;
    }
    if (!bot.util.checkProps("crypto")) {
        bot.util.crypto = Crypto;
    }
    bot.util.bindAll();
    bot.Logger.info("Utils Loaded");
}