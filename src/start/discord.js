const fs = require('fs');
const { Client, Collection } = require('discord.js-light');
const path = require('path');
const constants = require('../constants');
const util = require('../util/util');

const client = new Client({
    // https://discord.js.org/#/docs/main/v12/typedef/ClientOptions
    cacheGuilds: true,
    cacheChannels: true,
    cacheOverwrites: false,
    cacheRoles: false,
    cacheEmojis: true,
    cachePresences: false,
    disabledEvents: [
        'GUILD_UPDATE',
        'GUILD_MEMBER_ADD',
        'GUILD_MEMBER_REMOVE',
        'GUILD_MEMBER_UPDATE',
        'GUILD_MEMBERS_CHUNK',
        'GUILD_ROLE_CREATE',
        'GUILD_ROLE_DELETE',
        'GUILD_ROLE_UPDATE',
        'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE',
        'CHANNEL_UPDATE',
        'CHANNEL_PINS_UPDATE',
        'MESSAGE_DELETE',
        'MESSAGE_DELETE_BULK',
        'MESSAGE_REACTION_REMOVE_ALL',
        'USER_UPDATE',
        'USER_NOTE_UPDATE',
        'USER_SETTINGS_UPDATE',
        'VOICE_STATE_UPDATE',
        'TYPING_START',
        'VOICE_SERVER_UPDATE',
        'RELATIONSHIP_ADD',
        'RELATIONSHIP_REMOVE'
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

async function start() {
    try {
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
