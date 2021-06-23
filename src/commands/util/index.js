const fetchAll = require('discord-fetch-all');
const constants = require('../../constants');
const util = require('../../util/util');

let newreacts = 0;
let dryrun = false;
let noreact = false;
let withdata = 0;
let withoutdata = 0;
const updatedUsers = [];

const emojs = ['😳', '😐', '😞'];

async function checkandreact(message) {
    if (noreact) return;
    const reactions = message.reactions.cache;
    for (const emoj of emojs) {
        if (!reactions.get(emoj)?.me || reactions.get(emoj)?.me === false) {
            console.log(`Reacting to ${message.id} (${message.content})`);
            // eslint-disable-next-line no-await-in-loop
            if (!dryrun) await message.react(emoj);
            newreacts += 1;
        }
    }
}

async function upgradeDb(message, alreadysent, collection, users) {
    let data;
    // 1. Check by url. Simplest and lighest way
    if (
        message.content &&
        message.content.includes('https://') &&
        constants.conditions.some((e1) => message.content.includes(e1))
    ) {
        const result = await alreadysent.findOne({ url: message.content });
        if (result) data = result;
    }
    const hash = await util.submission.get_hash(message.content);
    if (!data && hash) data = await alreadysent.findOne({ hash });

    if (data) withdata += 1;
    else withoutdata += 1;

    if (message.content.includes('https://imgur.com/'))
        // eslint-disable-next-line no-param-reassign
        message.content = `${message.content.replace(/https:\/\/im/, 'https://i.im')}.jpg`; // Album img to text
    if (message.content.includes('imgur') && message.content.includes('gifv'))
        // eslint-disable-next-line no-param-reassign
        message.content = message.content.replace(/gifv/, 'gif');

    // Get reactions
    const flushed = [];
    const neutral = [];
    const disappointed = [];

    for (let i = 0; i < 3; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const reactions = await message.reactions.cache.get(emojs[i])?.users.fetch();
        if (reactions)
            for (const [dId, userdata] of reactions) {
                // eslint-disable-next-line no-continue
                if (dId === constants.bot_userid) continue;
                if (!updatedUsers.includes(dId)) {
                    if (!dryrun)
                        users.updateOne(
                            { id: dId },
                            {
                                $set: {
                                    id: dId,
                                    username: userdata.username,
                                    discriminator: userdata.discriminator,
                                    avatar: userdata.avatar
                                }
                            },
                            { upsert: true }
                        );
                    updatedUsers.push(dId);
                }

                switch (i) {
                    case 0:
                        flushed.push(dId);
                        break;
                    case 1:
                        neutral.push(dId);
                        break;
                    case 2:
                        disappointed.push(dId);
                        break;
                    default:
                        console.log(`Something is wrong, i is ${i}`);
                }
            }
    }
    const url = message.attachments.map((a) => a.attachment);
    if (url.length === 0) url[0] = message.content;

    if (!dryrun)
        collection.updateOne(
            { msgid: message.id },
            {
                $set: {
                    redditid: data?.id,
                    redditauthor: data?.author,
                    subreddit: data?.subreddit,
                    msgid: message.id,
                    sentby: message.author.id,
                    urls: url,
                    // eslint-disable-next-line no-await-in-loop
                    hash,
                    reactions: {
                        flushed,
                        neutral,
                        disappointed
                    }
                }
            },
            { upsert: true }
        ); // If there isn't data, delete
}

module.exports = {
    async execute(msg, args) {
        newreacts = 0;
        dryrun = false;
        withdata = 0;
        withoutdata = 0;
        noreact = false;

        if (args[0]) {
            if (args[0] === '--dry-run') dryrun = true;
            else if (args[0] === '--no-react') noreact = true;
            else return msg.reply(constants.commands.index.embeds.invalid_argument(args[0]));
        }
        if (args[1]) {
            if (args[1] === '--no-react') noreact = true;
            else if (args[1] === '--dry-run') dryrun = true;
            else return msg.reply(constants.commands.index.embeds.invalid_argument(args[1]));
        }
        if (!constants.commands.index.allowed.includes(msg.author.id))
            return msg.reply({ embed: constants.commands.index.embeds.notallowed });

        await msg.reply(constants.commands.index.embeds.starting(dryrun));

        console.log('Starting indexing...');
        console.log(`Channel id ${msg.channel.id}`);
        const allMessages = await fetchAll.messages(msg.channel, {
            reverseArray: true, // Reverse the returned array
            userOnly: true, // Only return messages by users
            botOnly: false, // Only return messages by bots
            pinnedOnly: false // Only returned pinned messages
        });
        // Create collection if it doesn't exist
        const db = Mongo.db('hentaibot');
        const list = await db.listCollections().toArray();
        if (!list.filter((e) => e.name === allMessages[0].guild.id)) await db.createCollection(allMessages[0].guild.id);
        if (!list.filter((e) => e.name === 'users')) await db.createCollection('users');
        else console.log('Collection already exists, so will skip creation.');
        const collection = db.collection(allMessages[0].guild.id);
        const users = db.collection('users');
        const alreadysent = db.collection('alreadysent');
        const alldone = [];
        for (const message of allMessages) {
            console.log(`Id: ${message.id}`);
            if (
                message.attachments.size > 0 ||
                message.content.includes('https://www.redgifs.com/watch/') ||
                (message.content.includes('https://') &&
                    constants.conditions.some((e1) => message.content.includes(e1)))
            ) {
                alldone.push(checkandreact(message, emojs));
                alldone.push(upgradeDb(message, alreadysent, collection, users));
            }
        }
        await Promise.all(alldone);
        console.log('Done...');
        return msg.reply(constants.commands.index.embeds.done(withoutdata + withdata, newreacts));
    }
};
