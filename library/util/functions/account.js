// @ts-nocheck
const superagent = require("superagent");
const tokens = require("../../../tokens.json");

module.exports = class Account {
    /** 
     * @param {String} name 
     * @param {String} platform 
    */
    static overwatchValidate(name, platform) {
        if (!this.bot.util.cache.checkLimit("gameOW", `${platform}${name.toLowerCase()}`, 0)) {
            return new Promise((resolve, reject) => {
                const overwatch = require("overwatch-api");
                // @ts-ignore
                overwatch.getProfile(platform, "global", name, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            return true;
        }
    }

    static csgoValidate(name) {
        if (!this.bot.util.cache.checkLimit("gameCSGO", name.toLowerCase(), 0)) {
            return new Promise((resolve, reject) => {
                superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/search?platform=steam&query=${name}`)
                    .set("TRN-Api-Key", tokens.games.csgo)
                    .then(res => {
                        const body = res.body;
                        if ((!res || !body) || !body.data || !body.data[0]) {
                            reject(new Error("Invalid Community URL or Account Name provided"));
                            return;
                        }

                        superagent.get(`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${body.data[0].platformUserId}`)
                            .set("TRN-Api-Key", tokens.games.csgo)
                            .then(() => resolve(body.data[0].platformUserId))
                            .catch(err => {
                                switch (err.message) {
                                    case "Unavailable For Legal Reasons":
                                        reject(new Error("Profile is private"));
                                    case "service unavailable":
                                        reject(new Error("We use <https://tracker.gg/csgo> for your CSGO Stats\n" +
                                            "It appears their service is unavailable right now. Try again later!"));
                                        break;
                                    default:
                                        reject(err);
                                }
                            });
                    }).catch(reject);
            });
        } else {
            return true;
        }
    }

    static modernwarfareValidate(name, platform) {
        if (!this.bot.util.cache.checkLimit("gameMW", name.toLowerCase(), 0)) {
            return new Promise((resolve, reject) => {
                const callofduty = require("call-of-duty-api")();

                callofduty.login(tokens.accounts.activision.username, tokens.accounts.activision.password)
                    .then(() => {
                        callofduty.MWstats(name, platform)
                            .then(() => resolve(true))
                            .catch(reject);
                    }).catch(reject);
            });
        } else {
            return true;
        }
    }

    static r6siegeValidate(name) {
        if (!this.bot.util.cache.checkLimit("gameR6", name.toLowerCase(), 0)) {
            return new Promise((resolve, reject) => {
                const r6APIJS = require("r6api.js");
                // @ts-ignore
                const r6 = new r6APIJS(tokens.accounts.ubisoft.username, tokens.accounts.ubisoft.password);

                r6.getId("uplay", name)
                    .then(res => {
                        const usrID = res[0].userId;
                        resolve(usrID);
                    }).catch(err => {
                        if (err.message === "Cannot read property 'userId' of undefined") {
                            reject(new Error("Invalid Account Name provided"));
                        } else {
                            reject(err);
                        }
                    });
            });
        } else {
            return true;
        }
    }

    static leagueoflegendsValidate(name, region) {
        if (!this.bot.util.cache.checkLimit("gameLOL", name.toLowerCase(), 0)) {
            return new Promise((resolve, reject) => {
                const matchRegion = {
                    "na": "na1",
                    "lan": "la1",
                    "las": "la2",
                    "eune": "eun1",
                    "euw": "euw1",
                    "oce": "oc1",
                    "br": "br1",
                    "jp": "jp1",
                    "kr": "kr",
                    "tr": "tr1",
                    "ru": "ru1"
                };
                region = matchRegion[region];

                superagent.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}` +
                    `?api_key=${tokens.accounts.riot}`)
                    .then(res => {
                        const accID = res.body.accountId;
                        resolve(accID);
                    }).catch(err => {
                        if (err.message === "Cannot ready property of 'accountId' of undefined"
                            || err.message === "Not Found") {
                            reject(new Error("Invalid Account Name provided"));
                        } else {
                            reject(err);
                        }
                    });
            });
        } else {
            return true;
        }
    }

    static pubgValidate(name, platform) {
        if (!this.bot.util.cache.checkLimit("gamePUBG", name.toLowerCase(), 0)) {
            return new Promise((resolve, reject) => {
                superagent.get(`https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${name}`)
                    .set("Authorization", `Bearer ${tokens.games.pubg}`)
                    .set("Accept", "application/vnd.api+json")
                    .then(res => {
                        const accID = res.body.data[0].id;
                        resolve(accID);
                    }).catch(err => {
                        if (err.message === "Not Found") {
                            reject(new Error("Invalid Account Name provided"));
                        } else {
                            reject(err);
                        }
                    });
            });
        } else {
            return true;
        }
    }
}