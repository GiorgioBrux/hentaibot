import Snoowrap from 'snoowrap';
import constants from '../constants';

async function start() {
    const reddit = new Snoowrap(constants.reddit.config);
    if (reddit) {
        console.log('Connected successfully to reddit!');
        return reddit;
    }

    throw new Error(`Couldn't create reddit object. Exiting...`);
} /**/

export default { start };
