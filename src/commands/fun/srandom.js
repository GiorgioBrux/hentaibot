import constants from '../../constants.js';
import util from '../../util/util.js';
import insert from '../../db/insert.js';

export default {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift().toString() : '1';

        await msg.reply(constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]);
        const response = await Sankaku.searchSubmissions({ order_by: 'random', limit: amount, tags: args });
        try {
            if (amount === '1' && !response?.data[0]?.file_url)
                return msg.reply(constants.commands.srandom.errors.no_link);

            let counter = 0;
            for (const data of response.data) {
                if (!data?.file_url) counter += 1;
                else {
                    // eslint-disable-next-line no-await-in-loop
                    let message = await util.submission.send({ url: data.file_url }, msg.channel);
                    if (!message) {
                        counter += 1;
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    [message] = message;

                    // eslint-disable-next-line no-await-in-loop
                    await insert.sankaku(message, data);
                }
            }
            if (amount !== '1') await msg.channel.send(constants.commands.srandom.misc.multi_done(counter));
        } catch (error) {
            await msg.reply(constants.commands.srandom.errors.generic(error));
        }
    }
};
