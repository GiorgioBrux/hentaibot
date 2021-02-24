/* eslint-disable no-param-reassign */
const constants = require('../../constants');

module.exports = {
    async send(submission, msg) {
        // @TODO: Check status (404?) of pics/videos before sending
        if (!submission.url || !constants.conditions.some((e1) => submission.url.includes(e1))) return 1;

        if (submission.url.includes('https://imgur.com/'))
            submission.url = `${submission.url.replace(/https:\/\/im/, 'https://i.im')}.jpg`; // Album img to text
        if (submission.url.includes('https://www.reddit.com/gallery/')) {
            const array = await JSON.parse(JSON.stringify(submission.media_metadata));
            for (const t of Object.entries(array)) {
                msg.send(t[1].s.u).then((a) => module.exports.add_reacts(a));
            }
            // console.log("Finished sending gallery");
        } else if (submission.url.includes('redgif')) {
            msg.send(submission.url).then((a) => module.exports.add_reacts(a));
        } else {
            // console.log(`Url: ${submission.url}`)
            let message;
            try {
                const ext = submission.url.match(/(\.\w{3,4})($|\?)/gim)[0];
                if (!ext)
                    console.log(
                        `${submission?.subreddit?.display_name} > ${submission?.id} > Error > No extension: ${submission.url}`
                    );
                message = await msg
                    .send({
                        files: [
                            {
                                attachment: submission.url,
                                name: (submission?.id ? submission.id : 'HGuy') + ext
                            }
                        ]
                    })
                    .catch((err) => {
                        console.log(err);
                        msg.send(submission.url);
                    })
                    .catch(() => {
                        module.exports.send(submission, msg);
                    });
            } catch (e) {
                message = await msg.send(submission.url);
            }
            module.exports.add_reacts(message);
        }
    },
    async add_reacts(msg) {
        await msg.react('😳');
        await msg.react('😐');
        await msg.react('😞');
    }
};
