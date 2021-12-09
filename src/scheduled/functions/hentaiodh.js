/* eslint-disable no-param-reassign */
const constants = require('../../constants');
const util = require('../../util/util');
const insert = require('../../db/insert');

module.exports = {
    async start() {
        async function search(number) {
            console.log(`hotd > Searching images in database`);
            for (const b of res) {
                // eslint-disable-next-line no-await-in-loop
                await module.exports.work(b, upsneeded);
            }
            return console.log(`${subreddit} > Search finished`);
        }

        console.log('hofd: Ready!');
        setInterval(async () => {
            await search(constants.hotd.number);
        }, 1440 * 60 * 1000); // Every day
    }
};
