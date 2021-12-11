import constants from '../../constants.js';
import util from '../../util/util.js';
import insert from '../../db/insert.js';
/* eslint-disable */ // Remove if ready

export default {
    async execute(msg, args) {
        return msg.reply({ embeds: [constants.embeds.generic_error('This command has been temporarily removed.')] });
        // @TODO: Make this true random or remove it.

        let subreddit;
        let number;
        let noimage = 0;
        if (args.length === 1) {
            if (/^\d+$/.test(args[0])) {
                [number] = args;
                const array = Object.keys(constants.subreddits);
                subreddit = { name: array[Math.floor(Math.random() * array.length)], custom: false }; // @TODO: Only choose the ones that are random-friendly
            } else {
                number = 1; // By default we only post 1 thing
                subreddit = {
                    name: args[0].replace(/r\//, '').replace(/^\//, ''),
                    custom: true
                };
            }
        } else if (args.length === 2) {
            [number] = args;
            subreddit = {
                name: args[1].replace(/r\//, '').replace(/^\//, ''),
                custom: true
            };
        } else {
            number = 1;
            const array = Object.keys(constants.subreddits);
            subreddit = { name: array[Math.floor(Math.random() * array.length)], custom: false }; // @TODO: Only choose the ones that are random-friendly
        }
        await msg.reply(`${constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]}`);
        if (subreddit.custom && Array.isArray(await Reddit.getSubreddit(subreddit.name).getRandomSubmission()))
            return msg.reply(constants.commands.rrandom.errors.no_random(subreddit.name));

        async function go() {
            if (!subreddit.custom) {
                const array = Object.keys(constants.subreddits);
                subreddit = { name: array[Math.floor(Math.random() * array.length)], custom: false };
            }
            const res = await Reddit.getSubreddit(subreddit.name).getRandomSubmission();
            try {
                if (Array.isArray(res)) {
                    const array = Object.keys(constants.subreddits);
                    subreddit = { name: array[Math.floor(Math.random() * array.length)], custom: false };
                    console.log('Riprovo...');
                    return go();
                }
                const [result] = await util.submission.send(res, msg.channel);
                if (!result) {
                    if (!subreddit.custom) return go();
                    if (number !== 1) {
                        noimage += 1;
                        return;
                    }
                    await msg.channel.send(constants.commands.rrandom.errors.no_image(1));
                    return;
                }
                return [result, res];
            } catch (err) {
                if (number === 1) msg.channel.send({ embeds: [constants.commands.rrandom.errors.generic(err)] });
                else return go();
            }
        }

        const messages = [];
        const db = [];
        for (let i = 0; i < number; i += 1) {
            messages.push(await go());
        }
        await Promise.all(messages);
        for (const message of messages) {
            if (!message) continue;
            db.push(insert.reddit(message[0], message[1]));
        }
        await Promise.all(db);
        if (number !== 1 && noimage !== 0) {
            return msg.channel.send(constants.commands.rrandom.errors.no_image(noimage));
        }
    }
};
