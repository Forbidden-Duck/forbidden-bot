// @ts-nocheck
const crypto = require("crypto");
const cryptojs = require("crypto-js");

module.exports = class Crypto {
    static encrypt(data, key) {
        return cryptojs.AES.encrypt(data, key).toString();
    }

    static decrypt(data, key) {
        return cryptojs.AES.decrypt(data, key).toString(cryptojs.enc.Utf8);
    }

    static generateKey(key) {
        return crypto.createHash("sha256").update((new Date().getTime() + "") + key).digest("hex");
    }
}