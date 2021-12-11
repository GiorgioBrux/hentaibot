import { imageHash } from 'image-hash';
import constants from '../../constants.js';

const obj = {
    async send(submission, msg) {
        // @TODO: Check status (404?) of pics/videos before sending
        if (!submission.url || !constants.conditions.some((e1) => submission.url.includes(e1))) return;

        if (submission.url.includes('https://www.reddit.com/gallery/')) {
            const array = await JSON.parse(JSON.stringify(submission.media_metadata));
            const messages = [];
            for (const t of Object.entries(array)) {
                // eslint-disable-next-line no-await-in-loop
                const message = await msg.send(t[1].s.u);
                messages.push(message);
                // eslint-disable-next-line no-await-in-loop
                await obj.add_reacts(message);
            }

            await Promise.all(messages);
            return messages;
            // Console.log("Finished sending gallery");
        }

        if (submission.url.includes('redgif')) {
            const message = await msg.send(submission.url);
            await obj.add_reacts(message);
            return [message];
        }

        // Console.log(`Url: ${submission.url}`)
        let message;
        try {
            const rex = /\.([^/#?]+)([#?][^/]*)?$/;
            rex.test(submission.url);
            const ext = `.${RegExp.$1}`;
            // Const ext = submission.url.match(/\.([^/#?]+)([#?][^/]*)?$/g)[0];
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

        await obj.add_reacts(message);
        return [message];
    },
    async add_reacts(msg) {
        await msg.react('😳');
        await msg.react('😐');
        msg.react('😞');
    },
    async get_hash(link) {
        if (!link || link.isArray) return null;
        return new Promise((resolve, reject) => {
            try {
                imageHash(link, 16, true, (err, data) => resolve(data));
            } catch (e) {
                reject(e);
            }
        });
    },
    async sanity_check(url) {
        // eslint-disable-next-line no-param-reassign
        if (url.includes('https://imgur.com/')) url = `${url.replace(/https:\/\/im/, 'https://i.im')}.jpg`; // Album img to text
        // eslint-disable-next-line no-param-reassign
        if (url.includes('imgur') && url.includes('gifv')) url = url.replace(/gifv/, 'gif');
        return url;
    }
};

export default obj;
