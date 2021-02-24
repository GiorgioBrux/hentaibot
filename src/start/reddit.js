const Snoowrap = require('snoowrap');
const constants = require('../constants.js');

module.exports = {
    async start() {
        const reddit = new Snoowrap(constants.reddit.config);
        if (reddit) return reddit;
        throw new Error(`Couldn't create reddit object. Exiting...`);
    }
};
