import util from '../../util/util.js';
import constants from '../../constants.js';

export default {
    async execute(msg, args) {
        const amount = /^\d+$/.test(args[0]) ? await args.shift() : 1;
        const result = await Mongo.db('hentaibot')
            .collection(msg.guild.id)
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
            ])
            .toArray();

        await msg.reply(`${constants.lovmessages[Math.floor(Math.random() * constants.lovmessages.length)]}`);
        if (!result || result.length < amount) {
            return msg.reply({ embeds: [constants.commands.random.embeds.error] });
        }

        for await (const item of result) {
            if (item != null) {
                const newmsg = await util.submission.send(item, msg.channel);
                let orgmsg;
                try {
                    orgmsg = await Discord.channels.cache.get(item.channelid).messages.fetch(item.msgid);
                } catch {
                    console.log('Error fetching orgmsg for .random');
                }
                console.log(`Old: ${item.msgid}, new: ${newmsg[0].id}`);
                await Mongo.db('hentaibot')
                    .collection(msg.guild.id)
                    .updateOne(
                        { msgid: item.msgid },
                        {
                            $set: {
                                msgid: newmsg[0].id
                            }
                        }
                    );
                await orgmsg.delete();
            }
        }
    }
};
