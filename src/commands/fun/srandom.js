const constants = require('../../constants');
const util = require('../../util/util');

module.exports = {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift().toString() : '1';
        if (parseInt(amount, 10) > parseInt(constants.commands.srandom.config.maxImages, 10))
            return msg.reply(
                constants.commands.srandom.errors.too_many_images(constants.commands.srandom.config.maxImages)
            );

        msg.channel.send(constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]);
        Sankaku.searchSubmissions({ limit: amount, tags: args.join(' ') })
            .then((response) => {
                if (amount !== '1') {
                    let counter = 0;
                    for (const data of response.data) {
                        if (!data.file_url) counter += 1;
                        else util.submission.send({ url: data.file_url }, msg.channel);
                    }
                    msg.channel.send(constants.commands.srandom.misc.multi_done(counter));
                } else {
                    if (!response.data[0].file_url) return msg.channel.send(constants.commands.srandom.errors.no_link);
                    util.submission.send({ url: response.data[0].file_url }, msg.channel);
                }
            })
            .catch((error) => msg.reply(constants.commands.srandom.errors.generic(error)));
    }
};
