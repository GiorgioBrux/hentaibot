const util = require('../util/util');

module.exports = {
    async unknown(msg, url) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                sentby: msg.author.id,
                reactions: {
                    flushed: [],
                    neutral: [],
                    disappointed: []
                },
                url,
                hash: await util.submission.get_hash(url)
            });
    },
    async reddit(msg, submission, url, hash) {
        Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                sentby: msg.author.id,
                reactions: {
                    flushed: [],
                    neutral: [],
                    disappointed: []
                },
                reddit: {
                    id: submission.id,
                    author: submission.author.name,
                    subreddit: submission.subreddit.display_name
                },
                url: url || msg.attachments.array()[0]?.url || msg.content,
                hash: hash || (await util.submission.get_hash(msg.attachments.array()[0]?.url || msg.content))
            });
    },
    async sankaku(msg, data) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                sentby: msg.author.id,
                reactions: {
                    flushed: [],
                    neutral: [],
                    disappointed: []
                },
                sankaku: {
                    id: data.id,
                    author: {
                        id: data.author.id,
                        name: data.author.name,
                        avatar: data.author.avatar
                    },
                    tags: data.tags.map((e) => ({
                        id: e.id,
                        name: e.name_en
                    }))
                },
                url: data.file_url,
                // eslint-disable-next-line no-await-in-loop
                hash: await util.submission.get_hash(msg.attachments.array()[0]?.url || msg.content)
            });
    }
};
