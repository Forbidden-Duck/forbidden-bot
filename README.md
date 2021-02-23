# Forbidden Statistics Test Environment
Make sure your environment is ready to start the bot.

## Setting up your environment

### node_modules
> Make sure all modules are installed and ready
> ```
> npm install
> ```
> Will install dependencies

### Database
> 1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
> 2. Download [MongoDB Compass (if not included with installer)](https://www.mongodb.com/products/compass)
> 3. Open a Terminal and navigate to the MongoDB Directory `C:/Program Files/MongoDB/Server/<VERSION>/bin`
> 4. Proceed by typing `mongo` to bring up mongo shell
> 5. Create the Database `use forbidden` will now swap to it (will be created once the collection exists)
> 6. Create the settings collection `db.createCollection("settings")`
> 7. Create the Admin User. Type on a single line and create your own user and pwd
> ```js
> db.createUser({
>     user: "Admin",
>     pwd: "password",
>     roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
> })
> ```
> 8. Create a read write user *which is used by the bot*. Type on a single line
> ```js
> db.createUser({
>     user: "User",
>     pwd: "password not same as Admin",
>     roles: [{ role: "readWrite", db: "forbidden" }]
> })
> ```


### tokens.json
> Setup your `tokens.json` follow the `tokens-template.json`\
> Having blank tokens will not break the program. The only required fields are
> 1. Bot Token
> 2. Bot Prefix
> 3. Database