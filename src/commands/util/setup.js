import { Permissions } from 'discord.js';
import constants from '../../constants.js';

export default {
    async execute(msg) {
        const filter = (m) => m.author.id === msg.author.id;

        if (
            !msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
            !constants.notstaff_allowed?.includes(msg.author.id)
        )
            return msg.reply({ embeds: [constants.embeds.notallowed] });

        const list = await Mongo.db('hentaibot').listCollections().toArray();

        if (!list.filter((e) => e.name === 'users')) await Mongo.db('hentaibot').createCollection('users');
        if (!list.filter((e) => e.name === 'guilds')) await Mongo.db('hentaibot').createCollection('guilds');

        // await msg.reply(constants.commands.setup.embeds.intro);
        if (Mongo.db('hentaibot').collection('guilds').find().toArray().length > 0) {
            await msg.reply({ embeds: [constants.commands.setup.embeds.alreadyexist] });
        }

        let answer;
        await msg.reply({
            embeds: [constants.commands.setup.embeds.intro, constants.commands.setup.embeds.first]
        });

        try {
            answer = await msg.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
        } catch {
            await msg.reply({ embeds: [constants.commands.setup.embeds.err(`I didn't get an answer in 30 seconds`)] });
            return;
        }

        if (Discord.channels.cache.get(answer.first().content) === undefined) {
            return answer.first().reply({
                embeds: [
                    constants.commands.setup.embeds.err(
                        `The channel id isn't valid or the bot doesn't have enough perms`
                    )
                ]
            });
        }

        const reply = await answer.first().reply({
            embeds: [constants.commands.setup.embeds.second]
        });

        await reply.react('✔');
        await reply.react('❌');
        const emojiFilter = (reaction, user) => ['❌', '✔'].includes(reaction.emoji.name) && user.id === msg.user.id;

        let reddit;
        try {
            reddit = await reply.awaitReactions({ emojiFilter, max: 1, time: 30000, errors: ['time'] });
        } catch {
            await msg.reply({ embeds: [constants.commands.setup.embeds.err(`I didn't get an answer in 30 seconds`)] });
            return;
        }
        const redditValue = reddit.first().emoji.name === '✔';
        console.log('Test');
        console.log(answer.first().content);
        console.log(redditValue);
        await Mongo.db('hentaibot')
            .collection('guilds')
            .updateOne(
                { guildId: msg.guild.id },
                {
                    $set: {
                        guildId: msg.guild.id,
                        channelId: answer.first().content,
                        reddit: redditValue
                    }
                },
                { upsert: true }
            );
        return answer.first().reply({ embeds: [constants.commands.setup.embeds.done] });
    }
};
