import yandere from 'yande-api';
import constants from '../../constants.js';
import util from '../../util/util.js';
import insert from '../../db/insert.js';

export default {
    // @TODO: Use a better library for yande.re, prob need to write from scratch
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift().toString() : '1';

        await msg.reply(constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]);

        const result = await yandere.getPost(['order:random', ...args], amount + 1, {});

        if (!result || result.length === 0) return msg.reply(constants.commands.yrandom.errors.not_found);

        let count = 0;

        for (const post of result) {
            if (count >= amount) return;
            count += 1;

            // eslint-disable-next-line no-await-in-loop
            const img = await util.submission.send({ url: post.file_url }, msg.channel);
            const single = img[0];
            // eslint-disable-next-line no-await-in-loop
            await insert.yandere(single, post);
        }
    }
};
