const constants = require('../../constants.js');

module.exports = {
    async execute(msg, args) {
        const { commands } = msg.client;
        if (!args.length) {
            const commandNames = commands.map((command) => command.name).join('\n');
            const usages = commands.map((command) => command.usage).join('\n');
            return msg.reply(constants.commands.help.embeds.help_all(commandNames, usages));
        }
        if (commands.get(args[0])) return msg.reply(constants.commands.help.embeds.help_single(args[0]));
        return msg.reply(constants.commands.help.embeds.notFound(args[0]));
    }
};
