import fetchAll from 'discord-fetch-all';
import { Permissions } from 'discord.js';
import constants from '../../constants.js';
import util from '../../util/util.js';

let newreacts = 0;
let dryrun = false;
let noreact = false;
let nodelete = false;
let deleted = 0;
let deletefail = 0;
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

async function delmess(message) {
    await message.delete().catch((e) => {
        deletefail += 1;
        return console.log(`Couldn't delete ${message.id} because of ${e}`);
    });
    deleted += 1;
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

    // eslint-disable-next-line no-param-reassign
    message.content = await util.submission.sanity_check(message.content);

    // 2. Check hash
    let url = message.attachments.map((a) => a.attachment);
    if (url.length === 0) url = message.content;
    if (url.length === 1) [url] = url;

    let hash;

    if (Array.isArray(url)) {
        hash = [];
        /*        for (const one of url) {
            hash.push(util.submission.get_hash(one));
        }
        await Promise.all(hash); */
        for (const one of url) {
            // eslint-disable-next-line no-await-in-loop
            hash.push(await util.submission.get_hash(one));
        }
    } else hash = await util.submission.get_hash(url);

    if (!data && hash) data = await alreadysent.findOne({ hash });

    if (data) withdata += 1;
    else withoutdata += 1;

    // 3. Check for duplicates

    if (!nodelete) {
        for (const one of [].concat(url)) {
            console.log(`Oneurl: ${one}`);
            // @ TODO: Better handling of the loops to search everything at once
            // eslint-disable-next-line no-await-in-loop
            let urldoc = await collection.find({ url: one }).toArray();
            urldoc = urldoc.filter((obj) => obj.msgid !== message.id);
            if (urldoc.length > 0) {
                console.log(`Deleting ${message.id} because it's a duplicate of ${urldoc[0].msgid}`);
                return delmess(message);
            }
        }
        for (const one of [].concat(hash)) {
            console.log(`Onehash: ${one}`);
            // eslint-disable-next-line no-await-in-loop
            let hashdoc = await collection.find({ hash: one }).toArray();
            hashdoc = hashdoc.filter((obj) => obj.msgid !== message.id);
            if (one !== undefined && hashdoc.length > 0) {
                console.log(`Deleting ${message.id} because it's a duplicate of ${hashdoc[0].msgid}`);
                return delmess(message);
            }
        }
    }
    await checkandreact(message);

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
                if (dId === '801130776775098378' || userdata.bot) continue;
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
    const redditdata = data?.id
        ? {
              reddit: {
                  id: data?.id,
                  author: data?.author,
                  subreddit: data?.subreddit
              }
          }
        : {};

    const sankakudata = data?.sankaku ? { sankaku: data?.sankaku } : {};

    if (!dryrun)
        collection.updateOne(
            { msgid: message.id },
            {
                $set: {
                    msgid: message.id,
                    channelid: message.channel.id,
                    sentby: message.author.id,
                    url,
                    hash,
                    reactions: {
                        flushed,
                        neutral,
                        disappointed
                    },
                    ...redditdata,
                    ...sankakudata
                }
            },
            { upsert: true }
        ); // If there isn't data, delete
}

export default {
    async execute(msg, args) {
        newreacts = 0;
        dryrun = false;
        withdata = 0;
        withoutdata = 0;
        noreact = false;
        nodelete = false;
        deleted = 0;
        deletefail = 0;

        for (const arg of args) {
            switch (arg) {
                case '--dry-run':
                    dryrun = true;
                    break;
                case '--no-react':
                    noreact = true;
                    break;
                case '--no-delete':
                    nodelete = true;
                    break;
                default:
                    return msg.reply({ embeds: [constants.commands.index.embeds.invalid_argument(args[0])] });
            }
        }

        if (
            !msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
            !constants.notstaff_allowed.includes(msg.author.id)
        )
            return msg.reply({ embeds: [constants.embeds.notallowed] });

        await msg.reply({ embeds: [constants.commands.index.embeds.starting(dryrun)] });

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
                // eslint-disable-next-line no-await-in-loop
                alldone.push(await upgradeDb(message, alreadysent, collection, users));
            }
        }
        await Promise.all(alldone);
        console.log('Done...');
        return msg.reply({
            embeds: [constants.commands.index.embeds.done(withoutdata + withdata, newreacts, deleted, deletefail)]
        });
    }
};
