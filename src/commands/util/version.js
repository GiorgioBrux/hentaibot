import run from 'child_process';
import constants from '../../constants.js';

export default {
    async execute(msg) {
        run.exec('git rev-parse HEAD', (err, version) => {
            run.exec('git diff --quiet HEAD', (err1) => {
                msg.reply({ embeds: [constants.commands.version.embeds.version(version, err1?.code)] });
            });
        });
    }
};
