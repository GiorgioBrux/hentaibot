import reddit from './start/reddit';
const database = require('./start/database');
const discord = require('./start/discord');
const sankaku = require('./start/sankaku');

const util = require('./util/util');
const constants = require('./constants');
const scheduled = require('./scheduled/scheduled');
const insert = require('./db/insert');

async function identifyEmoji(reaction, user) {
    switch (reaction.name) {
        case '😳':
            return { 'reactions.flushed': user.userID };
        case '😐':
            return { 'reactions.neutral': user.userID };
        case '😞':
            return { 'reactions.disappointed': user.userID };
        default:
    }
}

console.log('Starting...');
global.Mongo = await database.start();
global.Discord = await discord.start();
global.Reddit = await reddit.start();
global.Sankaku = await sankaku.start();

scheduled.reddit.start();

Discord.on('message', async (msg) => {
    if (msg.author.bot || msg.author.id === constants.bot_userid) return;
    if (!constants.commands_channelids.includes(msg.channel.id)) return;
    if (
        msg.attachments.size > 0 ||
        msg.content.includes('https://www.redgifs.com/watch/') ||
        (msg.content.includes('https://') && constants.conditions.some((e1) => msg.content.includes(e1)))
    ) {
        let url = msg.attachments.map((a) => a.attachment);
        if (url.length === 0) url = msg.content;
        if (url.length === 1) [url] = url;

        let hash;

        if (Array.isArray(url)) {
            await msg.reply({ embed: constants.embeds.multipleattachments });
            hash = [];
            for (const one of url) {
                // eslint-disable-next-line no-await-in-loop
                hash.push(await util.submission.get_hash(one));
            }
        } else hash = await util.submission.get_hash(url);

        const urldoc = await Mongo.db('hentaibot').collection(msg.guild.id).find({ url }).toArray();
        const hashdoc = await Mongo.db('hentaibot').collection(msg.guild.id).find({ hash }).toArray();

        if (urldoc.length > 0 || (hash && hashdoc.length > 0 && !url?.includes('redgif'))) {
            console.log(`${msg.guild.id} > ${msg.id} > Duplicate`);
            return msg.reply({
                embed: constants.embeds.duplicate(urldoc[0]?.msgid || hashdoc[0]?.msgid, msg.guild.id, msg.channel.id)
            });
        }
        await insert.unknown(msg, url);
        return util.submission.add_reacts(msg);
    }
    let args = msg.content.slice(constants.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (!msg.content.startsWith(constants.prefix)) return;

    const command =
        Discord.commands.get(commandName) ||
        Discord.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.args) {
        let fn;
        if (
            (!args[0] && command.args.required) ||
            (typeof command.args.min !== 'undefined' &&
                command.args.min !== 0 &&
                typeof args[command.args.min - 1] === 'undefined')
        )
            return msg.reply(constants.embeds.args.not_enough_error(command.args.min, command.usage, command.name));
        if (typeof command.args.max !== 'undefined' && typeof args[command.args.max] !== 'undefined')
            return msg.reply(constants.embeds.args.too_many_error(command.args.max, command.usage, command.name));
        // Check type
        if (command.args.type) {
            fn = function sendError(i) {
                msg.reply(
                    constants.embeds.args.wrong_type_error(
                        util.numbers.number_to_ordinal(i + 1),
                        i,
                        command.usage,
                        command
                    )
                );
            };
            // @TODO: Scroll through the argument instead of the type, and if type[i] doesn't exist, use the last used?
            for (const [i, v] of command.args.type.entries()) {
                if (typeof args[i] === 'undefined') break;
                switch (v) {
                    case 'number':
                        if (!/^\d+$/.test(args[i])) return fn(i);
                        break;
                    case 'string':
                        if (/^\d+$/.test(args[i])) return fn(i);
                        break;
                    case 'imagenumber':
                        if (!/^\d+$/.test(args[i])) {
                            // Exception for commands [amount] [string]
                            if (command.args.type[i + 1] !== 'string') return fn(i);
                            args = [1, args[0]];
                        }
                        if (args[i] > constants.maximages)
                            return msg.reply({ embed: constants.embeds.too_many_images(constants.maximages) });
                        break;
                    case 'all':
                        break;
                    default:
                        return msg.reply(constants.embeds.args.no_type_error(v));
                }
            }
        }
    }

    try {
        command.execute(msg, args);
    } catch (err) {
        msg.reply({ embed: constants.embeds.generic_error(err) });
    }
});

Discord.on('messageReactionAdd', async (reaction, user) => {
    // @TODO: Check if message is in hentai channel
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }
    const obj = identifyEmoji(reaction, user);
    if (!obj) return;
    Mongo.db('hentaibot').collection(reaction.guildID).updateOne({ msgid: reaction.messageID }, { $push: obj });
});

Discord.on('messageReactionRemove', async (reaction, user) => {
    // @TODO: Check if message is in hentai channel
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }
    const obj = identifyEmoji(reaction, user);
    if (!obj) return;
    Mongo.db('hentaibot').collection(reaction.guildID).updateOne({ msgid: reaction.messageID }, { $pull: obj });
});

Discord.on('messageDelete', async (msg) => {
    // @TODO: Check if message is in hentai channel
    Mongo.db('hentaibot').collection(msg.guildID).deleteOne({ msgid: msg.guildID });
});
