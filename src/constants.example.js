module.exports = {
    prefix: '.',
    conditions: ['png', 'jpeg', 'gif', 'jpg', 'mp4', 'imgur', 'redgif', 'gallery', 'webm'],
    bot_userid: '',
    token: '',
    mongodbUrl: '', // Only useful for selfbots
    commands_channelids: ['example'],
    reddit: {
        config: {
            userAgent: 'nodejs/app by /u/yourname',
            clientId: '',
            clientSecret: '',
            refreshToken: ''
        },
        search_timeout: 5, // Search frequency in minutes
        channel_ids: ['example']
    },
    embeds: {
        args: {
            required_error(required, usage, command) {
                return {
                    title: `❌ This command requires ${required || '0'} ${required === 1 ? 'arg' : 'args'}.`,
                    description: `Usage: ${module.exports.prefix}${command} ${usage || ''}`
                };
            }
        },
        generic_error(err) {
            return {
                title: '❌ There was an error executing this command',
                description: err,
                color: 15158332
            };
        },
        image(submission) {
            return {
                description: `** ${submission.subreddit_name_prefixed} | [${
                    submission.ups
                } upvotes](https://reddit.com${submission.permalink})${
                    !submission.url.includes('https://www.reddit.com/gallery/') && !submission.url.includes(`redgif`)
                        ? ` | [Saucenao](https://saucenao.com/search.php?url=${submission.url})`
                        : ``
                }**`,
                color: 9241214
            };
        },
        version(version, errcode) {
            return {
                description: `Running on \`${version.substring(0, 7)}${errcode ? '-develop' : undefined}\``,
                color: 15158332
            };
        },
        list(names, upvotes) {
            return {
                color: 3447003,
                fields: [
                    { name: 'Subreddits', value: names, inline: true },
                    { name: 'Upvotes needed', value: upvotes, inline: true }
                ]
            };
        }
    },
    commands: {
        random: {
            name: `random`,
            aliases: [`rnd`],
            usage: `[subreddit_name]`,
            args: {
                required: false,
                min: 0,
                max: 1
            },
            description: 'Gets a (not so) random image from a subreddit or from its subreddit list.',
            errors: {
                no_random(subreddit) {
                    return `I'm sorry, but the subreddit r/${subreddit} doesn't support the random feature.`;
                },
                no_image: "I'm sorry, I got a post but it doesn't contain any image :(",
                generic(err) {
                    return `I'm sorry, something went wrong: ${err.message}. Are you sure the subreddit exists and isn't banned?`;
                }
            }
        },
        srandom: {
            name: `srandom`,
            aliases: ['srnd'],
            description: `Get a random image from sankaku. Supports tags in the form of \`+yuri -video\`.`,
            errors: {
                no_link: `I'm sorry master, but I found a premium or deleted post. Please try again.`,
                generic(err) {
                    return `I'm sorry master, but something went wrong with the search: ${err}`;
                },
                404: `I'm sorry master, but something went terribly wrong. Maybe there aren't any results for the tags you searched?`,
                500: `I'm sorry master, but something went wrong with the search. Please note that I can't search only for excluded tags or for a lot of tags`,
                400: `I'm sorry master, but something went wrong with the search.`
            }
        },
        help: {
            name: `help`,
            description: `Prints an help embed with all commands.`,
            usage: `[command]`,
            args: {
                required: false,
                min: 0,
                max: 1
            }
        },
        list: {
            name: `list`,
            description: `Prints a table embed with subreddits and the needed upvotes for an image to be posted.`,
            args: {
                required: false,
                max: 0
            }
        },
        version: {
            name: `version`,
            description: `Posts the git commit hash.`,
            args: {
                required: false,
                max: 0
            }
        }
    },
    lovmessages: ['At your orders, master.'],
    subreddits: {
        hentai: 2000
    }
};
