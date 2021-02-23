// @ts-nocheck

module.exports = class Cache {
    /**
     * @param {String} [type]
     * @param {String} [key] 
    */
    static validateCache(type, key) {
        if (this.bot.cache == undefined) {
            this.bot.cache = {};
        }
        if (type != undefined
            && this.bot.cache[type] == undefined) {
            this.bot.cache[type] = {};
        }
        if (key != undefined
            && this.bot.cache[type][key] == undefined) {
            this.bot.cache[type][key] = [];
        }
    }

    /**
     * @param {String} type 
     * @param {String} key 
     * @param {Number} index 
    */
    static getCache(type, key, index) {
        this.cache.validateCache(type, key);
        return this.bot.cache[type][key][index];
    }

    /**
     * @param {String} type 
     * @param {String} key 
     * @param {Number} index 
     * @param {*} value 
    */
    static addCache(type, key, index, value) {
        this.cache.validateCache(type, key);
        this.bot.cache[type][key][index] = value;
    }

    static deleteCache() {
        this.cache.validateCache();
        for (let type in this.bot.cache) {
            const typeIndex = type;
            type = this.bot.cache[type];
            if (type != undefined) {
                for (let key in type) {
                    const keyIndex = key;
                    key = type[key];
                    if (key != undefined) {
                        for (let value in key) {
                            const valueIndex = value;
                            value = key[value];
                            if (value && value.ratelimit < new Date().valueOf()) {
                                delete key[valueIndex];
                            }
                        }
                        this.bot.cache[typeIndex][keyIndex] = key;
                    }
                }
            }
        }
    }

    /**
     * @param {String} type 
     * @param {String} key 
     * @param {Number} index 
    */
    static checkLimit(type, key, index) {
        this.cache.validateCache(type, key);
        if (this.bot.cache[type][key][index] != undefined) {
            return this.bot.cache[type][key][index].ratelimit > new Date().valueOf();
        } else {
            return false;
        }
    }
}