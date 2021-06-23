const constants = require('../../constants');
const util = require('../../util/util');

module.exports = {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift().toString() : '1';
        if (parseInt(amount, 10) > parseInt(constants.commands.srandom.config.maxImages, 10))
            return msg.reply(
                constants.commands.srandom.errors.too_many_images(constants.commands.srandom.config.maxImages)
            );

        await msg.channel.send(constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]);
        const response = await Sankaku.searchSubmissions({ order_by: 'random', limit: amount, tags: args });
        try {
            if (amount === '1' && !response?.data[0]?.file_url)
                return msg.channel.send(constants.commands.srandom.errors.no_link);

            let counter = 0;
            for (const data of response.data) {
                if (!data?.file_url) counter += 1;
                else {
                    // eslint-disable-next-line no-await-in-loop
                    let message = await util.submission.send({ url: data.file_url }, msg.channel);
                    [message] = message;
                    // eslint-disable-next-line no-await-in-loop
                    Mongo.db('hentaibot')
                        .collection(message.guild.id)
                        .insertOne({
                            msgid: message.id,
                            sentby: message.author.id,
                            reactions: {
                                flushed: [],
                                neutral: [],
                                disappointed: []
                            },
                            sankaku: {
                                id: data.id,
                                author: {
                                    id: data.author.id,
                                    name: data.author.name,
                                    avatar: data.author.avatar
                                },
                                tags: data.tags.map((e) => ({
                                    id: e.id,
                                    name: e.name_en
                                }))
                            },
                            url: data.file_url,
                            // eslint-disable-next-line no-await-in-loop
                            hash: await util.submission.get_hash(message.attachments.array()[0]?.url || message.content)
                        });
                }
            }
            if (amount !== '1') await msg.channel.send(constants.commands.srandom.misc.multi_done(counter));
        } catch (error) {
            msg.reply(constants.commands.srandom.errors.generic(error));
        }
    }
};
