const constants = require('../../constants');
const util = require('../../util/util');

module.exports = {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift() : 1;

        const result = await Mongo.db('hentaibot')
            .collection('alreadysent')
            .aggregate([
                {
                    $match: {
                        'reactions.flushed': { $in: [null, []] },
                        'reactions.neutral': { $in: [null, []] },
                        'reactions.disappointed': { $in: [null, []] },
                        url: { $type: 2 }
                    }
                },
                { $sample: { size: parseInt(amount, 10) } }
            ]);

        await result.each((err, item) => {
            if (item != null) {
                util.submission.send(item, msg.channel);
                const orgMsg = msg.fetch();
            }
        });
    }
};
