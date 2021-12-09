const constants = require('../../constants');

module.exports = {
    async execute(msg) {
        const repliedTo = await msg.channel.messages.fetch(msg.reference.messageID);
        // @TODO: Another embed that auto-destroys if message doesn't reply.
        const reply = await repliedTo.reply({ embed: constants.commands.report.embeds.report });
        await reply.react('🗑');
        await reply.react('✔');

        reply
            .awaitReactions((r) => ['🗑️', '✔'].includes(r.emoji.name), { max: 2, time: 120000 })
            .then((collected) => {
                const r = collected.first();
                if (r.emoji.name === '✔') msg.delete();
                else {
                    Mongo.db('hentaibot').collection(msg.guild.id).remove({ msgid: repliedTo.msgid });
                    repliedTo.delete();
                }
            });
    }
};
