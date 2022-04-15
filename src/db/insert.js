import util from '../util/util.js';

export default {
    async unknown(msg, url) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                channelid: msg.channel.id,
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
    async reddit(msg, submission, hash, url) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                channelid: msg.channel.id,
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
                url: url || msg.attachments.values()[0]?.url || msg.content,
                hash: hash || (await util.submission.get_hash(msg.attachments.first().url || msg.content))
            });
    },
    async sankaku(msg, data) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                channelid: msg.channel.id,
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

                hash: await util.submission.get_hash(msg.attachments.first().url || msg.content)
            });
    },
    async yandere(msg, data) {
        await Mongo.db('hentaibot')
            .collection(msg.guild.id)
            .insertOne({
                msgid: msg.id,
                channelid: msg.channel.id,
                sentby: msg.author.id,
                reactions: {
                    flushed: [],
                    neutral: [],
                    disappointed: []
                },
                yandere: {
                    id: data.id,
                    author: {
                        id: data.creator_id,
                        name: data.author
                    },
                    tags: data.tags.split(/\s+/)
                },
                url: data.file_url,
                hash: await util.submission.get_hash(msg.attachments.first().url || msg.content)
            });
    }
};
