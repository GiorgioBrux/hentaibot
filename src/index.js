const reddit = require('./start/reddit');
const database = require('./start/database.js');
const discord = require('./start/discord.js');

const util = require('./util/util.js');
const constants = require('./constants');
const scheduled = require('./scheduled/scheduled.js');

async function init() {
    global.Mongo = await database.start();
    global.Discord = await discord.start();
    global.Reddit = await reddit.start();

    scheduled.reddit.start();

    Discord.on('message', async (msg) => {
        if (msg.author.bot || msg.author.id === constants.bot_userid) return;
        if (!constants.commands_channelids.includes(msg.channel.id)) return;
        if (
            msg.attachments.size > 0 ||
            msg.content.includes('https://www.redgifs.com/watch/') ||
            (msg.content.includes('https://') && constants.conditions.some((e1) => msg.content.includes(e1)))
        )
            util.submission.add_reacts(msg);

        const args = msg.content.slice(constants.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        if (!msg.content.startsWith(constants.prefix)) return;

        const command =
            Discord.commands.get(commandName) ||
            Discord.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;

        if (command.args) {
            if (
                (!args[0] && command.args.required) ||
                (typeof command.args.min !== 'undefined' &&
                    command.args.min !== 0 &&
                    typeof args[command.args.min - 1] === 'undefined') ||
                (typeof command.args.max !== 'undefined' && typeof args[command.args.max] !== 'undefined')
            )
                return msg.reply({
                    embed: constants.embeds.args.required_error(command.args.min, command.usage, command.name)
                });
        }

        try {
            command.execute(msg, args);
        } catch (err) {
            msg.reply({ embed: constants.embeds.generic_error(err) });
        }
    });

    Discord.on('raw', (event) => {
        // @TODO: Reaction system
        if (event.t === 'MESSAGE_REACTION_ADD' || event.t === 'MESSAGE_REACTION_REMOVE') {
            // console.log(`event`);
            // const reaction = event.d.emoji;
            // const userID = event.d.user_id;
            const messageID = event.d.message_id;
            const guildID = event.d.guild_id;
            const channelID = event.d.channel_id;
            const guild = Discord.guilds.cache.get(guildID);
            const channel = guild.channels.cache.get(channelID);
            channel.messages.fetch({ limit: 1, around: messageID });
            // .then(message => console.log(message);
            // console.log(`${message.id}, id: ${messageID}`);
            // let role = guild.roles.cache.get(role_id)
            // console.log(`Reaction: ${JSON.parse(reaction)}, userID: ${userID}, messageID: ${messageID}, guildID: ${guildID}`)
            // let user = guild.members.cache.get(userID)
        }
    });
}

init();
