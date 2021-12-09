/* eslint-disable no-param-reassign */
const constants = require('../../constants');
const util = require('../../util/util');
const insert = require('../../db/insert');

module.exports = {
    async start() {
        async function search(subreddit, upsneeded) {
            console.log(`${subreddit} > Search start`);
            const res = await Reddit.getHot(subreddit);
            for (const b of res) {
                // eslint-disable-next-line no-await-in-loop
                await module.exports.work(b, upsneeded);
            }
            return console.log(`${subreddit} > Search finished`);
        }

        console.log('Reddit: Ready!');
        setInterval(async () => {
            console.log('Searching...');
            const entries = Object.entries(constants.subreddits);
            for (const [name, ups] of entries) {
                // eslint-disable-next-line no-await-in-loop
                await search(name, ups);
            }
        }, constants.reddit.search_timeout * 60 * 1000);
    },
    async work(submission, upsNeeded) {
        if (submission.ups < upsNeeded || !submission.url) return;

        // Check if it's a crosspost
        if (
            submission.crosspost_parent_list &&
            submission.crosspost_parent_list[0] &&
            submission.crosspost_parent_list.constructor === Array
        ) {
            // if (!submission.crosspost_parent_list[0]) return console.log(`${submission.subreddit.display_name} > ${submission.id} > Error > No id crosspost: ${JSON.stringify(submission)}`);
            const { id } = JSON.parse(JSON.stringify(submission.crosspost_parent_list))[0];
            const result = await Reddit.getSubmission(id).fetch();
            result.id = [result.id, submission.id];
            result.subreddit_name_prefixed = submission.subreddit_name_prefixed;
            submission = result;
        }
        submission.url = await util.submission.sanity_check(submission.url);

        const imageLinks = [];
        const hashes = [];
        if (await submission.url.includes('https://www.reddit.com/gallery/'))
            for (const t of Object.entries(JSON.parse(JSON.stringify(submission.media_metadata))))
                imageLinks.push(t[1].s.u);
        else imageLinks.push(submission.url);

        for (const link of imageLinks) {
            // eslint-disable-next-line no-await-in-loop
            const data = await util.submission.get_hash(link);
            // console.log(`hash: ${data}`);
            if (
                !data &&
                !submission.url.includes('redgif') &&
                !submission.url.includes('https://www.reddit.com/gallery/')
            )
                return;

            hashes.push(data);
        }

        // eslint-disable-next-line no-labels
        channel: for await (const id of constants.reddit.channel_ids) {
            const channel = await Discord.channels.cache.get(id);

            if (
                await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ 'reddit.id': submission.id })
            ) {
                console.log(
                    `${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Duplicate ID`
                );
                // eslint-disable-next-line no-continue
                continue;
            }
            if (await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ url: submission.url })) {
                console.log(
                    `${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Duplicate URL`
                );
                // eslint-disable-next-line no-continue
                continue;
            }
            for await (const data of hashes) {
                if (
                    (await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ hash: data })) &&
                    !submission.url.includes('redgif')
                ) {
                    console.log(
                        `${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Duplicate hash`
                    );
                    // eslint-disable-next-line no-continue,no-labels
                    continue channel;
                }
            }

            await channel.send({ embed: constants.embeds.image(submission) });
            const message = await util.submission.send(submission, channel);
            console.log(`${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Sent!`);
            message.forEach((msg, i) => {
                insert.reddit(msg, imageLinks[i], hashes[i]);
            });
        }
        // console.log(JSON.stringify({ id: submission.id, url: submission.url, image_links: image_links, author: submission.author.name, subreddit: submission.subreddit.display_name, hash: hashes }));
    }
};
