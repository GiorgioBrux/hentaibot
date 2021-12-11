import constants from '../../constants.js';

export default {
    async execute(msg) {
        if (!msg.reference) return msg.reply({ embeds: [constants.commands.report.embeds.noreply] });
        const repliedTo = await msg.channel.messages.fetch(msg.reference.messageID);
        // @TODO: Another embed that auto-destroys if message doesn't reply.
        const reply = await repliedTo.reply({ embeds: [constants.commands.report.embeds.report] });
        await reply.react('🗑');
        await reply.react('✔');

        reply
            .awaitReactions((r) => ['🗑', '✔'].includes(r.emoji.name), { max: 1, time: 12000000, errors: ['time'] })
            .then((collected) => {
                const r = collected.first();
                console.log(`Got ${JSON.stringify(r)}`);
                if (r.emoji.name === '✔') reply.delete();
                else {
                    repliedTo.delete();
                    reply.delete();
                    // Deletion from the database is already handled in index.js
                }
            });
    }
};
