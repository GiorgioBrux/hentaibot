/* eslint-disable */ // Remove if ready

import constants from '../../constants.js';

async function start() {
    // @TODO: Finish this
    async function search(number) {
        console.log(`hotd > Searching images in database`);
        for (const b of res) {
            await work(b, upsneeded);
        }
        return console.log(`${subreddit} > Search finished`);
    }

    console.log('hofd: Ready!');
    setInterval(async () => {
        await search(constants.hotd.number);
    }, 1440 * 60 * 1000); // Every day
}

export default { start };
