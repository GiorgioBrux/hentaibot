import constants from '../../constants.js';

export default {
    async execute(msg, args) {
        const { commands } = msg.client;
        if (!args.length) {
            const commandNames = await commands.map((command) => command.name).join('\n');
            const usages = await commands.map((command) => command.usage).join('\n');
            return msg.reply({ embeds: [constants.commands.help.embeds.help_all(commandNames, usages)] });
        }
        if (commands.get(args[0])) return msg.reply({ embeds: [constants.commands.help.embeds.help_single(args[0])] });
        return msg.reply({ embeds: [constants.commands.help.embeds.notFound(args[0])] });
    }
};
