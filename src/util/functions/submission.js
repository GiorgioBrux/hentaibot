/* eslint-disable no-param-reassign */
const { imageHash } = require('image-hash');
const constants = require('../../constants');

module.exports = {
    async send(submission, msg) {
        // @TODO: Check status (404?) of pics/videos before sending
        if (!submission.url || !constants.conditions.some((e1) => submission.url.includes(e1))) return 1;

        if (submission.url.includes('https://imgur.com/'))
            submission.url = `${submission.url.replace(/https:\/\/im/, 'https://i.im')}.jpg`; // Album img to text
        if (submission.url.includes('https://www.reddit.com/gallery/')) {
            const array = await JSON.parse(JSON.stringify(submission.media_metadata));
            const messages = [];
            for (const t of Object.entries(array)) {
                // eslint-disable-next-line no-await-in-loop
                const message = await msg.send(t[1].s.u);
                messages.push(message);
                // eslint-disable-next-line no-await-in-loop
                await module.exports.add_reacts(message);
            }
            await Promise.all(messages);
            return messages;
            // console.log("Finished sending gallery");
        }
        if (submission.url.includes('redgif')) {
            const message = await msg.send(submission.url);
            await module.exports.add_reacts(message);
            return [message];
        }
        // console.log(`Url: ${submission.url}`)
        let message;
        try {
            const rex = new RegExp('\\.([^/#?]+)([#?][^/]*)?$');
            rex.test(submission.url);
            const ext = `.${RegExp.$1}`;
            // const ext = submission.url.match(/\.([^/#?]+)([#?][^/]*)?$/g)[0];
            // console.log(`Ext: ${ext}`);
            if (!ext)
                console.log(
                    `${submission?.subreddit?.display_name} > ${submission?.id} > Error > No extension: ${submission.url}`
                );
            if (ext === '.gifv') return Promise.reject(Error());
            message = await msg.send({
                files: [
                    {
                        attachment: submission.url,
                        name: (submission?.id ? submission.id : 'HGuy') + ext
                    }
                ]
            });
        } catch (e) {
            console.log(`Submission sending error: ${e}`);
            message = await msg.send(submission.url);
        }
        module.exports.add_reacts(message);
        return [message];
    },
    async add_reacts(msg) {
        await msg.react('😳');
        await msg.react('😐');
        msg.react('😞');
    },
    async get_hash(link) {
        return new Promise((resolve, reject) => {
            try {
                imageHash(link, 16, true, (err, data) => resolve(data));
            } catch (e) {
                reject(e);
            }
        });
    }
};
