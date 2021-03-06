module.exports = {
    prefix: '.',
    conditions: ['png', 'jpeg', 'gif', 'jpg', 'mp4', 'imgur', 'redgif', 'gallery', 'webm'],
    bot_userid: '',
    discordToken: '',
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
            not_enough_error(required, usage, commandName) {
                return {
                    embed: {
                        title: `:x: This command requires ${required || '0'} ${required === 1 ? 'arg' : 'args'}.`,
                        description: `Usage: ${module.exports.prefix}${commandName} ${usage || ''}`,
                        color: 15158332
                    }
                };
            },
            too_many_error(needed, usage, commandName) {
                return {
                    embed: {
                        title: `:x: This command can have a maximum of ${needed} ${needed === 1 ? 'arg' : 'args'}.`,
                        description: `Usage: ${module.exports.prefix}${commandName} ${usage || ''}`,
                        color: 15158332
                    }
                };
            },
            wrong_type_error(numberOrdinal, argIndex, usage, command) {
                return {
                    embed: {
                        title: `:x: This command requires the ${numberOrdinal} argument to be a \`${command.args.type[argIndex]}\`.`,
                        description: `Usage: ${module.exports.prefix}${command.name} ${usage || ''}`,
                        color: 15158332
                    }
                };
            },
            no_type_error(type) {
                return {
                    embed: {
                        title: `:x: Internal error`,
                        description: `Invalid arg type: ${type}`,
                        color: 15158332
                    }
                };
            }
        },
        generic_error(err) {
            return {
                title: ':x: There was an error executing this command',
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
                max: 1,
                type: ['string']
            },
            description: 'Gets a (not so) random image from a subreddit or from its subreddit list.',
            errors: {
                no_random(subreddit) {
                    return `I'm sorry, but the subreddit r/${subreddit} doesn't support the random feature.`;
                },
                no_image: "I'm sorry, I got a post but it doesn't contain any image :(",
                generic(err) {
                    return `I'm sorry, something went wrong: ${err.response.statusCode} ${err.response.statusMessage}. Are you sure the subreddit exists and isn't banned?`;
                }
            }
        },
        srandom: {
            name: `srandom`,
            aliases: ['srnd'],
            usage: ['[amount] [tags]'],
            description: `Get a random image from sankaku. Supports tags in the form of \`+yuri -video\`.`,
            args: {
                required: false,
                min: 0
            },
            config: {
                maxImages: '100'
            },
            misc: {
                multi_done(number) {
                    return `${
                        number !== 0
                            ? `:warning: ${number} image${number > 1 ? 's' : ''} won't be posted because ${
                                  number > 1 ? 'they are' : 'it is'
                              } deleted or premium only.`
                            : `:white_check_mark: No premium or deleted post found.`
                    }`;
                }
            },
            errors: {
                too_many_images(maxImages) {
                    return {
                        embed: {
                            title: `:x: The maximum number of images is ${maxImages}/command`,
                            color: 15158332
                        }
                    };
                },
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
            aliases: ['commands'],
            usage: `[command_name]`,
            args: {
                required: false,
                min: 0,
                max: 1
            },
            embeds: {
                notFound(commandName) {
                    return {
                        embed: {
                            title: `:x: Command \`${commandName}\` does not exist`,
                            color: 15158332
                        }
                    };
                },
                help_all(commandNames, usages) {
                    return {
                        embed: {
                            title: "Here's all the commands, master",
                            color: 16580705,
                            fields: [
                                { name: 'Command', value: commandNames, inline: true },
                                { name: 'Usage', value: usages, inline: true }
                            ]
                        }
                    };
                },
                help_single(commandName) {
                    return {
                        embed: {
                            title: `Here's what you need to know:`,
                            color: 2123412,
                            fields: [
                                { name: 'Description', value: module.exports.commands[commandName].description },
                                {
                                    name: 'Usage',
                                    value: `${module.exports.prefix}${commandName} ${
                                        module.exports.commands[commandName].usage || ''
                                    }`,
                                    inline: true
                                }
                            ]
                        }
                    };
                }
            }
        },
        list: {
            name: `list`,
            description: `Prints a table embed with subreddits and the needed upvotes for an image to be posted.`,
            args: {
                required: false,
                max: 0
            },
            embeds: {
                list(names, upvotes) {
                    return {
                        embed: {
                            color: 3447003,
                            fields: [
                                { name: 'Subreddits', value: names, inline: true },
                                { name: 'Upvotes needed', value: upvotes, inline: true }
                            ]
                        }
                    };
                }
            }
        },
        version: {
            name: `version`,
            description: `Posts the git commit hash.`,
            args: {
                required: false,
                max: 0
            },
            embeds: {
                version(version, errcode) {
                    return {
                        embed: {
                            description: `Running on \`${version.substring(0, 7)}${errcode ? '-develop' : '-github'}\``,
                            color: 15158332
                        }
                    };
                }
            }
        }
    },
    lovmessages: ['At your orders, master.'],
    subreddits: {
        hentai: 2000
    }
};
