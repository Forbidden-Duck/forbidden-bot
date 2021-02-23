const Eris = require("eris");
const { CommandClient } = require("eris.js-commando");
const mongodb = require("mongodb");

/**
 * @typedef {Object} DB
 * @property {mongodb.MongoClient} client
 * @property {mongodb.MongoClient} [connection]
 * @property {mongodb.Db} [forbidden]
*/

/**
 * @typedef {Object} MongoDB
 * @property {String} host Host Address
 * @property {String} name Host Name
 * @property {Object} [auth] Auth (Not required)
 * @property {String} auth.username Auth Username
 * @property {String} auth.password Auth Password
*/
let MongoDB = {};
const MongoDBOptions = { useUnifiedTopology: true };

module.exports = class MongoDBProvider {
    /**
     * Create a new MongoDB Provider
     * @param {MongoDB} mongo Required options
    */
    constructor(mongo) {
        this.mongo = mongo;
        if (this.mongo.auth != undefined) {
            this.url =
                `mongodb://${this.mongo.auth.username}:${this.mongo.auth.password}@${this.mongo.host}/`;
        } else {
            this.url =
                `mongodb://${this.mongo.host}/`;
        }
        /**
         * @type {DB}
        */
        this.db = {
            client: new mongodb.MongoClient(this.url + this.mongo.name, MongoDBOptions)
        };
        this.schemas = {
            guilds: require("./schemas/guilds"),
            users: require("./schemas/users"),
            commands: require("./schemas/commands")
        };
    }

    /**
     * Initialises the provider by connecting to the database and caching all data in memory
     * @param {CommandClient} bot 
    */
    async init(bot) {
        this.bot = bot;

        try {
            this.db.connection = await this.db.client.connect();
            if (!(this.db.connection instanceof mongodb.MongoClient)) {
                this.bot.Logger.error("Failed to connect to MongoDB Database");
            } else {
                this.bot.Logger.info("MongoDB Database connected");
            }

            this.db.forbidden = this.db.connection.db(this.mongo.name);
            const collections = await this.db.forbidden.collections();
            if (collections.find(coll => coll.collectionName === "guilds") == undefined) {
                this.db.forbidden.createCollection("guilds");
            }
            if (collections.find(coll => coll.collectionName === "users") == undefined) {
                this.db.forbidden.createCollection("users");
            }
            if (collections.find(coll => coll.collectionName === "commands") == undefined) {
                this.db.forbidden.createCollection("commands");
            }
            this.setupGuilds();
        } catch (err) {
            bot.Logger.error(err);
        }
    }

    /** 
     * @param {String} name
     * @returns {mongodb.Collection}
    */
    getCollection(name) {
        return this.db.forbidden.collection(name);
    }

    /** 
     * @param {String} name
     * @returns {Object} 
    */
    getSchema(name) {
        return this.schemas[name];
    }

    /** 
     * @param {String} collName 
     * @param {Object} filter 
     * @param {mongodb.FindOneOptions} [options]
     * @param {Boolean} [useSchema]
     * @returns {Promise<Array<*>>}
    */
    async find(collName, filter, options, useSchema) {
        const collection = this.getCollection(collName);
        let documents = await collection.find(filter, options).toArray();
        if (useSchema == true) {
            if (documents.length != 0) {
                for (const documentIndex in documents) {
                    const schema = Object.assign({}, this.getSchema(collName));
                    const document = documents[documentIndex];
                    if (typeof document === "object") {
                        documents[documentIndex] = Object.assign(schema, document);
                    }
                }
            } else {
                const schema = Object.assign({}, this.getSchema(collName));
                documents[0] = schema;
            }
        }
        return documents;
    }

    /** 
     * @param {String} collName 
     * @param {String} id
     * @param {*} document 
     * @param {Boolean} [useSchema]
     * @returns {Promise<mongodb.InsertOneWriteOpResult>}
    */
    async insert(collName, id, document, useSchema) {
        const collection = this.getCollection(collName);
        if (useSchema == true) {
            const schema = this.getSchema(collName);
            const oldSchema = schema;
            document = Object.assign(schema, document);
            Object.assign(schema, oldSchema);
        }
        document._id = id;
        return collection.insertOne(document);
    }

    /**
     * @param {String} collName 
     * @param {Object} filter 
     * @param {Object} update
     * @param {Boolean} [upsert]
     * @returns {Promise<mongodb.UpdateWriteOpResult>}
    */
    async update(collName, filter, update, upsert) {
        const collection = this.getCollection(collName);
        return collection.updateOne(filter, update, { upsert: upsert });
    }

    /** 
     * @param {String} collName 
     * @param {Object} filter
     * @returns {Promise<mongodb.DeleteWriteOpResultObject>}
    */
    async delete(collName, filter) {
        const collection = this.getCollection(collName);
        return collection.deleteOne(filter);
    }

    /** 
     * @param {String} guildID 
     * @param {String} [prefix]
    */
    async updatePrefix(guildID, prefix) {
        if (prefix == undefined
            || this.bot.clientOptions.prefix === prefix) {
            this.bot.removeGuildPrefix(this.bot.guilds.get(guildID));
            return await this.update("guilds", { _id: guildID }, { $unset: { prefix: "" } });
        } else {
            this.bot.addGuildPrefix(this.bot.guilds.get(guildID), prefix);
            return await this.update("guilds", { _id: guildID }, { $set: { prefix: prefix } }, true);
        }
    }

    async setupGuilds() {
        const guilds = await this.find("guilds", {}, {}, true);
        for (const guild of guilds) {
            if (guild.prefix != undefined
                && guild.prefix !== this.bot.clientOptions.prefix) {
                this.bot.guildPrefixes[guild._id] = guild.prefix;
            }
        }
    }
}