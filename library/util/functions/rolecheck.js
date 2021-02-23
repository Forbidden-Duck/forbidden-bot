// @ts-nocheck
const Eris = require("eris");
const guildID = "250486125431488512";

module.exports = class RoleCheck {
    /** 
     * @param {Eris.User} user 
     * @param {String} rank 
    */
    static checkStaff(user, rank) {
        if (user == undefined) {
            return false;
        }

        if (rank == undefined) {
            return false;
        }

        if (this.bot.user.id === user.id) {
            return true;
        }

        const member = this.bot.guilds.get(guildID).members.get(user.id);
        if (member == undefined) {
            return false;
        }

        // Owner
        const ownerRoleIDs = [this.data.getStaffRole("Owner").id];
        // Co-Owner
        const coownerRoleIDs = ownerRoleIDs.concat([this.data.getStaffRole("Co-Owner").id]);
        // Manager
        const managerRoleIDs = coownerRoleIDs.concat([this.data.getStaffRole("Manager").id]);
        // Developer
        const developerRoleIDs = managerRoleIDs.concat([this.data.getStaffRole("Developer").id]);
        // Trial Developer
        const trialdeveloperRoleIDs = developerRoleIDs.concat([this.data.getStaffRole("Trial Dev").id]);
        // Moderator
        const moderatorRoleIDs = trialdeveloperRoleIDs.concat([this.data.getStaffRole("Moderator").id]);
        // Support Team
        const supportRoleIDs = moderatorRoleIDs.concat([this.data.getStaffRole("Support Team").id]);

        switch (rank) {
            case "isOwner":
                return member.roles.some(role => ownerRoleIDs.includes(role));
            case "isCoOwner":
                return member.roles.some(role => coownerRoleIDs.includes(role));
            case "isManager":
                return member.roles.some(role => managerRoleIDs.includes(role));
            case "isDeveloper":
                return member.roles.some(role => developerRoleIDs.includes(role));
            case "isTrialDeveloper":
                return member.roles.some(role => trialdeveloperRoleIDs.includes(role));
            case "isModerator":
                return member.roles.some(role => moderatorRoleIDs.includes(role));
            case "isSupport":
                return member.roles.some(role => supportRoleIDs.includes(role));
            default:
                return false;
        }
    }

    /** 
     * @param {Eris.User} user 
     * @param {String} rank 
    */
    static checkDonor(user, rank) {
        if (user == undefined) {
            return false;
        }

        if (rank == undefined) {
            return false;
        }

        const member = this.bot.guilds.get(guildID).members.get(user.id);
        if (member == undefined) {
            return false;
        }

        // Donator
        const donatorRoleIDs = [this.data.getDonorRole("Donator").id];

        switch (rank) {
            case "is$5":
                return member.roles.some(role => donatorRoleIDs.includes(role));
            default:
                return false;
        }
    }

    /** 
     * @param {Eris.User} user 
    */
    static checkTester(user) {
        if (user == undefined) {
            return false;
        }

        const member = this.bot.guilds.get(guildID).members.get(user.id);
        if (member == undefined) {
            return false;
        }

        const testerRole = this.bot.guilds.get(guildID).roles.find(role => role.name === "Tester").id;
        return member.roles.includes(testerRole);
    }
}