/* eslint-disable no-param-reassign */
import constants from '../../constants.js';
import util from '../../util/util.js';
import insert from '../../db/insert.js';

async function work(submission, upsNeeded) {
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
        if (!data && !submission.url.includes('redgif') && !submission.url.includes('https://www.reddit.com/gallery/'))
            return;

        hashes.push(data);
    }

    // eslint-disable-next-line no-labels
    channel: for await (const id of constants.commands_channelids) {
        console.log(`id: ${id}`);
        const channel = await Discord.channels.cache.get(id);
        if (!channel) {
            console.log(`Warning: Couldn't get channel with id: ${id}`);
            // eslint-disable-next-line no-continue
            continue;
        }

        if (await Mongo.db('hentaibot').collection(channel.guild.id).countDocuments({ 'reddit.id': submission.id })) {
            console.log(`${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Duplicate ID`);
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

        await channel.send({ embeds: [constants.embeds.image(submission)] });
        const message = await util.submission.send(submission, channel);
        console.log(`${channel.guild.id} > ${submission.subreddit.display_name} > ${submission.id} > Sent!`);
        message.forEach((msg, i) => {
            insert.reddit(msg, submission, hashes[i], imageLinks[i]);
        });
    }
    // console.log(JSON.stringify({ id: submission.id, url: submission.url, image_links: image_links, author: submission.author.name, subreddit: submission.subreddit.display_name, hash: hashes }));
}

async function start() {
    let reddit = false;
    async function search(subreddit, upsneeded) {
        console.log(`${subreddit} > Search start`);
        const res = await Reddit.getHot(subreddit);
        for (const b of res) {
            // eslint-disable-next-line no-await-in-loop
            await work(b, upsneeded);
        }
        return console.log(`${subreddit} > Search finished`);
    }

    console.log('Reddit: Ready!');
    setInterval(async () => {
        if (reddit) return;
        reddit = true;
        console.log('Searching...');
        const entries = Object.entries(constants.subreddits);
        for (const [name, ups] of entries) {
            // eslint-disable-next-line no-await-in-loop
            await search(name, ups);
        }
        reddit = false;
    }, constants.reddit.search_timeout * 60 * 1000);
}

export default { start };
