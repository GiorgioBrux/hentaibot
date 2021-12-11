import { MongoClient } from 'mongodb';
import constants from '../constants.js';

const Mongo = new MongoClient(constants.mongodbUrl);

async function start() {
    try {
        const mongo = await Mongo.connect();
        console.log('Connected successfully to database!');
        return mongo;
    } catch (e) {
        throw new Error(`Couldn't connect to database: ${e}. Exiting process...`);
    }
}

export default { start };
