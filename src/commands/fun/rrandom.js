const constants = require('../../constants');
const util = require('../../util/util');
const insert = require('../../db/insert');

module.exports = {
    async execute(msg, args) {
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
            await Reddit.getSubreddit(subreddit.name)
                .getRandomSubmission()
                .then(async (res) => {
                    if (Array.isArray(res)) {
                        const array = Object.keys(constants.subreddits);
                        subreddit = { name: array[Math.floor(Math.random() * array.length)], custom: false };
                        return go();
                    }
                    const [result] = await util.submission.send(res, msg.channel);
                    if (!result) {
                        if (!subreddit.custom) return go();
                        if (number !== 1) {
                            noimage += 1;
                            return;
                        }
                        return msg.channel.send(constants.commands.rrandom.errors.no_image(1));
                    }
                    return result;
                })
                .catch((err) => {
                    if (number === 1) msg.channel.send(constants.commands.rrandom.errors.generic(err));
                    else return go();
                });
        }
        const messages = [];
        const db = [];
        for (let i = 0; i < number; i += 1) {
            messages.push(go());
        }
        await Promise.all(messages);
        for (const message of messages) {
            db.push(insert.reddit(message));
        }
        await Promise.all(db);
        if (number !== 1 && noimage !== 0) {
            return msg.channel.send(constants.commands.rrandom.errors.no_image(noimage));
        }
    }
};
