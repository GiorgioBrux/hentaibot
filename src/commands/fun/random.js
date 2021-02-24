const constants = require('../../constants.js');
const util = require('../../util/util');

module.exports = {
    async execute(msg, args) {
        // @TODO: Request more images in same command
        msg.channel.send(`${constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]}`);
        let subreddit;
        async function go() {
            if (args.constructor === Array && args[1] !== undefined)
                return msg.reply(`Sorry master, you can specify only one arg [subreddit_name]`);
            if (args[1] === undefined && args[0] !== undefined) {
                subreddit = args[0].replace(/r\//, '');
            } else {
                const array = Object.keys(constants.subreddits);
                subreddit = array[Math.floor(Math.random() * array.length)]; // @TODO: Only choose the ones that are random-friendly
            }
            await Reddit.getSubreddit(subreddit)
                .getRandomSubmission()
                .then(async (res) => {
                    if (Array.isArray(res)) {
                        if (args[0] === undefined) return go();
                        return msg.channel.send(constants.commands.random.errors.no_random(subreddit));
                    }
                    const result = await util.submission.send(res, msg.channel);
                    if (result === 1)
                        if (args[0] === undefined) return go();
                        else return msg.channel.send(constants.commands.random.errors.no_image);
                })
                .catch((err) => msg.channel.send(constants.commands.random.errors.generic(err)));
        }
        return go();
    }
};
