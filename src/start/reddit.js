const Snoowrap = require('snoowrap');
const constants = require('../constants');

module.exports = {
    async start() {
        const reddit = new Snoowrap(constants.reddit.config);
        if (reddit) {
            console.log('Connected successfully to reddit!');
            return reddit;
        }

        throw new Error(`Couldn't create reddit object. Exiting...`);
    }
};
