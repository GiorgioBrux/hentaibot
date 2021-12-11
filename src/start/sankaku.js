import { Client } from 'sankaku-client';
import constants from '../constants.js';

async function start() {
    try {
        const client = new Client();
        await client.login({ login: constants.sankaku.login, password: constants.sankaku.password });
        console.log(`Connected successfully to sankaku!`);
        return client;
    } catch (e) {
        throw new Error(`Couldn't connect to sankaku: ${e}. Exiting...`);
    }
}

export default { start };
