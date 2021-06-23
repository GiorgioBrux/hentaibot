const run = require('child_process');
const constants = require('../../constants');

module.exports = {
    async execute(msg) {
        run.exec('git rev-parse HEAD', (err, version) => {
            run.exec('git diff --quiet HEAD', (err1) => {
                msg.reply(constants.commands.version.embeds.version(version, err1?.code));
            });
        });
    }
};
