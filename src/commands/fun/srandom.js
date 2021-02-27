const axios = require('axios');
const constants = require('../../constants');
const util = require('../../util/util');

module.exports = {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift().toString() : '1';
        if (parseInt(amount, 10) > parseInt(constants.commands.srandom.config.maxImages, 10))
            return msg.reply(
                constants.commands.srandom.errors.too_many_images(constants.commands.srandom.config.maxImages)
            );
        let tags = args.join('+');
        if (tags) tags = `+${tags}`; // add starting plus
        msg.channel.send(constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]);
        const config = {
            method: 'get',
            url: `https://capi-v2.sankakucomplex.com/posts/keyset?lang=en&default_threshold=1&hide_posts_in_books=in-larger-tags&limit=${amount}&tags=order:random+rating:e${tags}`,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
                // 'Authorization': `Bearer ` + access_token,
                dnt: 1,
                origin: 'https://beta.sankakucomplex.com',
                referer: 'https://beta.sankakucomplex.com/',
                accept: 'application/vnd.sankaku.api+json;v=2'
            }
        };
        axios(config)
            .then((response) => {
                if (amount !== '1') {
                    let counter = 0;
                    for (const data of response.data.data) {
                        if (!data.file_url) counter += 1;
                        else util.submission.send({ url: data.file_url }, msg.channel);
                    }
                    msg.channel.send(constants.commands.srandom.misc.multi_done(counter));
                } else {
                    if (!response.data.data[0].file_url)
                        return msg.channel.send(constants.commands.srandom.errors.no_link);
                    util.submission.send({ url: response.data.data[0].file_url }, msg.channel);
                }
            })
            .catch((error) => {
                if (!error.response?.status) return msg.reply(constants.commands.srandom.errors['404']);
                if (error.response.status === 400) return msg.reply(constants.commands.srandom.errors['400']);
                if (error.response.status === 401) {
                    // @TODO: Wrong token
                } else if (error.response.status === 500) {
                    return msg.reply(constants.commands.srandom.errors['500']);
                } else return msg.reply(constants.commands.srandom.errors.generic(error));
            });
    }
};
