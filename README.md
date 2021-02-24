# Hentaibot

> おにいーちゃん やめて ください

A WIP fully featured hentai bot for discord.
Gets hentai from reddit and reposts it to the specified channels.

## Commands

#### Fun

- `.random [subreddit_name]`: Gets a (not so) random image from a subreddit or from its subreddit list.
- `.srandom [tags]`: Get a random image from sankaku. Supports tags in the form of `+yuri -video`.

#### Info

- `.version`: Posts the git commit hash.
- `.help`: Prints an help embed with all commands.
- `.list`: Prints a table embed with subreddits and the needed upvotes for an image to be posted.

### Installation

> :warning: This is meant to be used with a user token, not a bot.  
> If you want to use a bot token instead, point `discord.js-light` in `package.json` to `latest`.

To use, open the `src`, make the necessary changes to `constants.example.js` and rename it to `constants.js`.
