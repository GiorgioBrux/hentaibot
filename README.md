# Hentaibot

> お兄ちゃん やめて ください

A WIP fully featured hentai bot for discord.<br>
It can automatically get hentai from reddit and repost them to discord channels if an upvote threshold is reached.

## Commands

#### Fun

- `.random [number]`: Gets a random submission from the database of existing pictures.
- `.rrandom [number] [subreddit_name]`: Gets a (not so) random image from a subreddit or from its subreddit list.
- `.srandom [number] [tags]`: Get a random image from sankaku. Supports tags in the form of `yuri -video`.

#### Info

- `.version`: Posts the git commit hash.
- `.help`: Prints an help embed with all commands.
- `.list`: Prints a table embed with subreddits and the needed upvotes for an image to be posted.

#### Util
- `.index`: Index the images in a channel to the database. To migrate to the new database, run this and then delete the `alreadysent` collection.
- `.report`: Report a rule-breaking image.

### Installation
For WIP noob-proof instructions see [here](https://github.com/GiorgioBrux/hentaibot/wiki/How-to-Setup-%5BWIP%5D), otherwise keep reading.

To use, open the `src`, and create a file called `constants-custom.js`.<br>
This file will overwrite the default settings found in `constants-default.js`<br>
It is recommended to use at least these settings, albeit not all are strictly necessary: <br>
```javascript
export default {
    prefix: '.',
    discordToken: 'yourtoken',
    mongodbUrl:
        'your mongodb url',
    commands_channelids: [
        'yourchannel'
    ],
    sankaku: {
        login: 'user',
        password: 'hunter2'
    },
    reddit: {
        config: {
            userAgent: 'nodejs/app by /u/yourusername',
            clientId: '',
            clientSecret: '',
            refreshToken: ''
        },
        search_timeout: 60 // Search frequency in minutes
    }
};

```
Then run `node .` and you are set. <br>
Note: there is a `.setup` command, but its still not honored. <br>
The bot will try to send reddit images in all channels in `commands_channelIds` for now.
