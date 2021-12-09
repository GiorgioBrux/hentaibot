# Hentaibot

> おにいーちゃん やめて ください

A WIP fully featured hentai bot for discord.<br>
It can automatically get hentai from reddit and repost them to discord channels if an upvote threshold is reached.

<span style="font-size:larger;">WARNING: THIS BOT IS CURRENLTY ONGOING MASSIVE REFACTORING AND BREAKING CHANGES, BEFORE UPDATING CHECK CHANGES</span>

## Commands

#### Fun

- `.random [number]`: Gets a random submission from the database of existing pictures.
- `.rrandom [number] [subreddit_name]`: Gets a (not so) random image from a subreddit or from its subreddit list.
- `.srandom [number] [tags]`: Get a random image from sankaku. Supports tags in the form of `yuri -video`.

#### Info

- `.version`: Posts the git commit hash.
- `.help`: Prints an help embed with all commands.
- `.list`: Prints a table embed with subreddits and the needed upvotes for an image to be posted.


### Installation

> :warning: This is meant to be used with a user token, not a bot.  
> If you want to use a bot token instead, point `discord.js-light` in `package.json` to `latest`.

To use, open the `src`, make the necessary changes to `constants.example.js` and rename it to `constants.js`.<br>
Then run `node .` and you are set.
