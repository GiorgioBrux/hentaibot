/* eslint-disable no-param-reassign */
const constants = require('../../constants');
const util = require('../../util/util');

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

        console.log('Ready!');
        setInterval(async () => {
            console.log('Searching...');
            const entries = Object.entries(constants.subreddits);
            for (const [name, ups] of entries) {
                // eslint-disable-next-line no-await-in-loop
                await search(name, ups);
            }
        }, constants.reddit.search_timeout * 60 * 1000);
    },
    async work(submission, upsNeeded, orgSubreddit, orgId) {
        if (orgId) submission.id = [submission.id, orgId];
        if (orgSubreddit) {
            submission.subreddit_name_prefixed = orgSubreddit;
            submission.subreddit.display_name = orgSubreddit.substring(2);
        }
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
            // console.log(`found!: ${JSON.stringify(result)}`);
            // console.log("Finished fetching the original post,");
            return module.exports.work(result, upsNeeded, submission.subreddit_name_prefixed, submission.id);
        }
        if (submission.url.includes('https://imgur.com/'))
            submission.url = `${submission.url.replace(/https:\/\/im/, 'https://i.im')}.jpg`; // Album img to text
        if (submission.url.includes('imgur') && submission.url.includes('gifv'))
            submission.url = submission.url.replace(/gifv/, 'gif');
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

            if (await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ redditid: submission.id })) {
                console.log(
                    `${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Duplicate ID`
                );
                // eslint-disable-next-line no-continue
                continue;
            }
            if (await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ urls: submission.url })) {
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
                Mongo.db('hentaibot')
                    .collection(channel.guild.id)
                    .insertOne({
                        msgid: msg.id,
                        sentby: msg.author.id,
                        reactions: {
                            flushed: [],
                            neutral: [],
                            disappointed: []
                        },
                        redditid: submission.id,
                        urls: imageLinks,
                        redditauthor: submission.author.name,
                        subreddit: submission.subreddit.display_name,
                        hash: hashes[i]
                    });
            });
        }
        // console.log(JSON.stringify({ id: submission.id, url: submission.url, image_links: image_links, author: submission.author.name, subreddit: submission.subreddit.display_name, hash: hashes }));
    }
};
