"use strict";

const Ready = require("./events/ready");
const MessageCreate = require("./events/messageCreate");
const GuildCreate = require("./events/guildCreate");
const GuildDelete = require("./events/guildDelete");
const CommandError = require("./events/commandError");
const CommandExecute = require("./events/commandExecute");

const LoadEvents = {};
LoadEvents.ready = Ready;
LoadEvents.messageCreate = MessageCreate;
LoadEvents.guildCreate = GuildCreate;
LoadEvents.guildDelete = GuildDelete;
LoadEvents.commandError = CommandError;
LoadEvents.commandExecute = CommandExecute;

module.exports = LoadEvents;