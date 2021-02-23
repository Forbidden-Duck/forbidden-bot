// @ts-nocheck
const Eris = require("eris");
const roledata = require("../../roledata");
const guildID = "250486125431488512";

module.exports = class Data {
    /**
     * @returns {Array<Eris.Role>}
    */
    static getStaffRoles() {
        return Object.entries(roledata.staff)
            .map(rle => this.bot.guilds.get(guildID).roles.get(rle[1]));
    }

    static getStaffRole(role) {
        const staffRoles = this.data.getStaffRoles();
        if (staffRoles.find(rle => rle.name.toLowerCase().startsWith(role.toLowerCase())) != undefined) {
            return staffRoles.find(rle => rle.name.toLowerCase().startsWith(role.toLowerCase()));
        }
        if (staffRoles.find(rle => rle.id === role)) {
            return staffRoles.find(rle => rle.id === role);
        }
        return undefined;
    }

    /**
     * @returns {Array<Eris.Role>}
    */
    static getDonorRoles() {
        return Object.entries(roledata.donators)
            .map(rle => this.bot.guilds.get(guildID).roles.get(rle[1]));
    }

    static getDonorRole(role) {
        const donorRoles = this.data.getDonorRoles();
        if (donorRoles.find(rle => rle.name.toLowerCase().startsWith(role.toLowerCase())) != undefined) {
            return donorRoles.find(rle => rle.name.toLowerCase().startsWith(role.toLowerCase()));
        }
        if (donorRoles.find(rle => rle.id === role)) {
            return donorRoles.find(rle => rle.id === role);
        }
        return undefined;
    }
}