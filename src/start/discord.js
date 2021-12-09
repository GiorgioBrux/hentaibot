const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js-light');
const path = require('path');
const constants = require('../constants');
const util = require('../util/util');

const client = new Client({
    // https://discord.js.org/#/docs/main/v12/typedef/ClientOptions
    intents: [Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES]
});

async function start() {
    try {
        console.log(JSON.stringify(constants, null, 4));
        await client.login(constants.discordToken);
        console.log(`Connected successfully to discord!`);
        client.commands = new Collection();
        const commandFolders = fs.readdirSync(path.resolve(__dirname, `../commands/`));

        for (const folder of commandFolders) {
            // eslint-disable-next-line no-await-in-loop
            const commandFiles = await fs
                .readdirSync(path.resolve(__dirname, `../commands/${folder}`))
                .filter((file) => file.endsWith('.js'));
            for (let file of commandFiles) {
                // eslint-disable-next-line no-await-in-loop,import/no-dynamic-require,global-require
                const command = await require(`../commands/${folder}/${file}`);
                file = file.toString().substring(0, file.toString().length - 3); // Remove .js extension
                client.commands.set(constants.commands[util.path.name(file)].name, {
                    ...command,
                    ...constants.commands[util.path.name(file)]
                });
            }
        }
        return client;
    } catch (e) {
        throw new Error(`Couldn't connect to discord: ${e}. Exiting...`);
    }
}

module.exports = { start };
