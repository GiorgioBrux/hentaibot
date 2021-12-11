import fs from 'fs';
import path from 'path';
import discord from 'discord.js';
import { fileURLToPath } from 'url';
import constants from '../constants.js';
import util from '../util/util.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const commandFolders = fs.readdirSync(path.resolve(dirname, `../commands/`));

const client = new discord.Client({
    // https://discord.js.org/#/docs/main/v12/typedef/ClientOptions
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.GUILD_MESSAGES
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

async function start() {
    try {
        console.log(JSON.stringify(constants, null, 4));
        await client.login(constants.discordToken);
        console.log(`Connected successfully to discord!`);

        await client.user.setActivity(constants.activity);

        client.commands = new discord.Collection();

        console.log(util.path.name('help'));
        console.log('done');

        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(path.resolve(dirname, `../commands/${folder}`))
                .filter((file) => file.endsWith('.js'));
            for (let file of commandFiles) {
                // eslint-disable-next-line no-await-in-loop
                const command = await import(`../commands/${folder}/${file}`);
                file = file.toString().substring(0, file.toString().length - 3); // Remove .js extension
                console.log(`File: ${file}`);
                client.commands.set(constants.commands[util.path.name(file)].name, {
                    ...command.default,
                    ...constants.commands[util.path.name(file)]
                });
            }
        }
        return client;
    } catch (e) {
        throw new Error(`Couldn't connect to discord: ${e}. Exiting...`);
    }
}

export default { start };
