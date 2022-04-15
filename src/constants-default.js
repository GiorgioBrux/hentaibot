const obj = {
    prefix: '.',
    version: '1.0.0',
    maximages: 30,
    notstaff_allowed: [], // Trusted people (can run .index, delete everything)
    conditions: ['png', 'jpeg', 'gif', 'jpg', 'mp4', 'imgur', 'redgif', 'gallery', 'webm'],
    bot_userid: '',
    discordToken: '',
    mongodbUrl: '',
    commands_channelids: ['example'],
    activity: 'Indexing the best hentai on the net...',
    sankaku: {
        login: '',
        password: ''
    },
    reddit: {
        config: {
            userAgent: 'nodejs/app by /u/yourname',
            clientId: '',
            clientSecret: '',
            refreshToken: ''
        },
        search_timeout: 60 // Search frequency in minutes
    },
    embeds: {
        args: {
            not_enough_error(required, usage, commandName) {
                return {
                    title: `:x: This command requires ${required || '0'} ${required === 1 ? 'arg' : 'args'}.`,
                    description: `Usage: ${obj.prefix}${commandName} ${usage || ''}`,
                    color: 15158332
                };
            },
            too_many_error(needed, usage, commandName) {
                return {
                    title: `:x: This command can have a maximum of ${needed} ${needed === 1 ? 'arg' : 'args'}.`,
                    description: `Usage: ${obj.prefix}${commandName} ${usage || ''}`,
                    color: 15158332
                };
            },
            wrong_type_error(numberOrdinal, argIndex, usage, command) {
                return {
                    title: `:x: This command requires the ${numberOrdinal} argument to be a \`${command.args.type[argIndex]}\`.`,
                    description: `Usage: ${obj.prefix}${command.name} ${usage || ''}`,
                    color: 15158332
                };
            },
            no_type_error(type) {
                return {
                    title: `:x: Internal error`,
                    description: `Invalid arg type: ${type}`,
                    color: 15158332
                };
            }
        },
        generic_error(err) {
            return {
                title: ':x: There was an error executing this command',
                description: err.toString(),
                color: 15158332
            };
        },
        too_many_images(maxImages) {
            return {
                title: `:x: The maximum number of images is ${maxImages}/command`,
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
        duplicate(msgid, guildid, channelid) {
            return {
                title: `:x: This submission is a duplicate`,
                description: `[Click here to get the original submission](https://discord.com/channels/${guildid}/${channelid}/${msgid}). 
                    This channel has a string policy against duplicates.`,
                footer: {
                    text: 'Message will be auto-deleted in a few seconds.'
                },
                color: 15158332
            };
        },
        notallowed: {
            title: ':x: Only server administrators and users in the allowed bot list can run this command.',
            color: 15158332
        },
        multipleattachments: {
            title: `:x: This submission has multiple attachments in one message`,
            description: `This practice is forbidden because it doesn't allow easy indexing.`,
            footer: {
                text: 'Message will be auto-deleted in a few seconds.'
            },
            color: 15158332
        }
    },
    commands: {
        rrandom: {
            name: `rrandom`,
            aliases: [`rnd`],
            usage: `[amount] [subreddit_name]`,
            args: {
                required: false,
                min: 0,
                max: 2,
                type: ['imagenumber', 'string']
            },
            description: 'Gets a (not so) random image from a subreddit or from its subreddit list.',
            errors: {
                no_random(subreddit) {
                    return `I'm sorry, but the subreddit r/${subreddit} doesn't support the random feature.`;
                },
                no_image(number) {
                    return `I'm sorry, I got ${
                        number === 1 ? "a post that doesn't" : `${number} posts that don't`
                    } contain any image :(`;
                },
                generic(err) {
                    return `I'm sorry, something went wrong: ${err.response?.statusCode} ${err.response?.statusMessage}. Are you sure the subreddit exists and isn't banned?`;
                }
            }
        },
        srandom: {
            name: `srandom`,
            aliases: ['srnd'],
            usage: ['[amount] [tags]'],
            description: `Get a random image from sankaku. Supports tags in the form of \`yuri -video\`.`,
            args: {
                required: false,
                min: 0,
                max: 2,
                type: ['imagenumber', 'string']
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
                no_link: `I'm sorry master, but I found a premium or deleted post. Please try again.`,
                generic(err) {
                    return `I'm sorry master, but something went wrong with the search: ${err}`;
                },
                404: `I'm sorry master, but something went terribly wrong. Maybe there aren't any results for the tags you searched?`,
                500: `I'm sorry master, but something went wrong with the search. Please note that I can't search only for excluded tags or for a lot of tags`,
                400: `I'm sorry master, but something went wrong with the search.`
            }
        },
        yrandom: {
            name: 'yrandom',
            aliases: ['yrnd'],
            usage: ['[amount] [tags]'],
            description: `Get a random image from yande.re. Supports tags in the form of \`yuri -video\`.`,
            args: {
                required: false,
                min: 0,
                max: 2,
                type: ['imagenumber', 'string']
            },
            config: {
                maxImages: '100'
            },
            errors: {
                not_found: `I'm sorry master, but I didn't find anything. Are you sure these tags are valid?`
            }
        },
        random: {
            name: 'random',
            description: 'Gets a true random submission from the database with 0 reactions.',
            usage: '[amount]',
            args: {
                required: false,
                min: 0,
                max: 1,
                type: ['imagenumber']
            },
            embeds: {
                error: {
                    title: ':x: An error occured while trying to fetch the data from the db',
                    description:
                        'Either you are using HGuy from very recently, or all the images have been reacted to at least once.',
                    color: 15158332
                }
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
                max: 1,
                type: ['string']
            },
            embeds: {
                notFound(commandName) {
                    return {
                        title: `:x: Command \`${commandName}\` does not exist`,
                        color: 15158332
                    };
                },
                help_all(commandNames, usages) {
                    return {
                        title: "Here's all the commands, master",
                        color: 16580705,
                        fields: [
                            { name: 'Command', value: commandNames, inline: true },
                            { name: 'Usage', value: usages, inline: true }
                        ]
                    };
                },
                help_single(commandName) {
                    return {
                        title: `Here's what you need to know:`,
                        color: 2123412,
                        fields: [
                            { name: 'Description', value: obj.commands[commandName].description },
                            {
                                name: 'Usage',
                                value: `${obj.prefix}${commandName} ${obj.commands[commandName].usage || ''}`,
                                inline: true
                            }
                        ]
                    };
                }
            }
        },
        index: {
            name: 'index',
            usage: '[--dry-run] [--no-react]',
            description:
                'Indexes the channel to the database. Should be used if the bot was down while hentai was posted.',
            allowed: ['753623012070129835', '435086341055709185', '408849832283865118'],
            args: {
                required: false,
                min: 0,
                max: 2,
                type: ['string', 'string']
            },
            embeds: {
                starting(dryrun) {
                    return {
                        title: `:information_source: Starting indexing ${
                            dryrun ? '(Dry run)' : '(Real mode)'
                        }. It could take a long time!`,
                        description: 'Will send another message when everything is done :)',
                        color: 3426654
                    };
                },
                invalid_argument(arg) {
                    return {
                        title: `:x: Aborting operation because of invalid argument ${arg}`,
                        color: 15158332
                    };
                },
                done(newimages, reactions) {
                    return {
                        title: ':white_check_mark: Indexing finished.',
                        description: `Scanned ${newimages} messages and added ${reactions} reactions!`
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
                        color: 3447003,
                        fields: [
                            { name: 'Subreddits', value: names, inline: true },
                            { name: 'Upvotes needed', value: upvotes, inline: true }
                        ]
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
                        description: `Running \`${obj.version}\` on \`${version.substring(0, 7)}${
                            errcode ? '-develop' : '-github'
                        }\``,
                        color: 15158332
                    };
                }
            }
        },
        report: {
            name: 'report',
            description: 'Report a rule breaking submission.',
            args: {
                required: false,
                max: 0
            },
            embeds: {
                report: {
                    title: ':warning: This image has been reported.',
                    color: 16776960,
                    description: `Please don't report this image again. Someone will take a look asap.`
                },
                noreply: {
                    title: ':x: You need to reply to an image to report it.',
                    color: 15158332,
                    description: 'Please also to make sure to report only rule-breaking images.'
                }
            }
        },
        setup: {
            name: 'setup',
            description: 'Start interactive first-time setup.',
            args: {
                required: false,
                max: 0
            },
            embeds: {
                error(err) {
                    return {
                        title: ':x: Setup errored out',
                        description: err
                    };
                },
                err(err) {
                    return {
                        title: `${err}. Setup cancelled.`,
                        color: 15158332
                    };
                },
                done: {
                    title: 'All done! Setup completed.',
                    color: 3066993
                },
                alreadyexist: {
                    title: ':warning: This will overwrite the existing config for this guild',
                    color: 16776960
                },
                intro: {
                    title: 'Thanks for using hentaibot.',
                    color: 15844367,
                    description:
                        'If you could star the github repo [here](https://github.com/GiorgioBrux/hentaibot) I would really appreciate it'
                },
                first: {
                    title: 'Please reply to this message with the channel_id of the hentai channel',
                    color: 3066993,
                    description: 'Make sure the bot has the required perms to see the channel.'
                },
                second: {
                    title: 'Perfect. Do you want to enable automatic reddit posting from said channel?',
                    color: 3066993
                }
            }
        }
    },
    lovmessages: ['At your orders, master.'],
    subreddits: {
        hentai: 2000
    }
};

export default obj;
