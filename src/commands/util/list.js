import constants from '../../constants.js';

export default {
    async execute(msg) {
        // @TODO: Sort by upvotes needed
        const alpha = Object.keys(constants.subreddits)
            .sort()
            // eslint-disable-next-line no-sequences,no-return-assign,no-param-reassign
            .reduce((a, c) => ((a[c] = constants.subreddits[c]), a), {});

        const names = Object.keys(alpha).join('\n');
        const upvotes = Object.values(alpha).join('\n');
        await msg.reply({ embeds: [constants.commands.list.embeds.list(names, upvotes)] });
    }
};
