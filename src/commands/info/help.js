module.exports = {
    async execute(msg, args) {
        if (args.constructor === Array && args[1] !== undefined)
            return msg.reply(`Sorry master, you can specify only one arg [command]`);
    }
};
