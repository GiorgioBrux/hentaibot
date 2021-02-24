const { MongoClient } = require('mongodb');
const constants = require('../constants');

const Mongo = new MongoClient(constants.mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function start() {
    try {
        const mongo = await Mongo.connect();
        console.log('Connected successfully to database!');
        return mongo;
    } catch (e) {
        throw new Error(`Couldn't connect to database: ${e}. Exiting process...`);
    }
}

module.exports = { start };
