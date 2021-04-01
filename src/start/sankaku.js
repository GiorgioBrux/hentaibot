const { Client } = require('sankaku-client');
const constants = require('../constants.js');

async function start() {
    try {
        const client = new Client();
        await client.login({ login: constants.sankaku.login, password: constants.sankaku.password });
        console.log(`Connected successfully to sankaku!`);
    } catch (e) {
        throw new Error(`Couldn't connect to sankaku: ${e}. Exiting...`);
    }
}

module.exports = { start };
