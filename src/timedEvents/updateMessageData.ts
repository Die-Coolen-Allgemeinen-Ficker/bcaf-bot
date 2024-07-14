import {
    ChannelType,
    Message,
    TextChannel 
} from 'discord.js';
import { TimedEvent } from '../timedEvent';
import { bcafBot } from '../main';
import { BCAFAccount } from '../account/bcafAccount';

import { writeFileSync } from 'fs';

interface MessageCount {
    _id: string;
    content: string;
    authorId: string;
    channelId: string;
    createdTimestamp: number;
}

type UserMessageCount = { [userId: string]: {
    messageCount: number;
    messagesLast30Days: number;
    characterCount: number;
} };

interface Channel {
    _id: string;
    name: string;
    createdTimestamp: number;
    archived: boolean;
}

async function fetchMessages (channel: TextChannel) {
    const messages: MessageCount[] = [];
    const userMessageCount: UserMessageCount = {};
    const first = (await channel.messages.fetch({ limit: 1 })).first();
    if (!first)
        return { messages, userMessageCount };
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const timestamp = oneMonthAgo.getTime();
    let results: Message[] = [];

    do {
        results = [ ...(await channel.messages.fetch({
            limit: 100,
            before: results[results.length - 1] ? results[results.length - 1].id : first.id
        })).values() ];

        for (const message of results) {
            messages.push({
                _id: message.id,
                content: message.content,
                authorId: message.author.id,
                channelId: message.channelId,
                createdTimestamp: message.createdTimestamp
            });

            if (message.author.bot)
                continue;

            if (!userMessageCount[message.author.id])
                userMessageCount[message.author.id] = {
                    messageCount: 0,
                    messagesLast30Days: 0,
                    characterCount: 0
                };
            userMessageCount[message.author.id].messageCount++;
            userMessageCount[message.author.id].messagesLast30Days += (message.createdTimestamp >= timestamp ? 1 : 0);
            userMessageCount[message.author.id].characterCount += message.content.length;
        }
    } while (results.length);

    return { messages, userMessageCount };
}

const now = new Date();
export default new TimedEvent(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4),
    async () => {
        console.log(`${new Date().toUTCString()} Updating message data...`);
        console.log(`${new Date().toUTCString()} Fetching all messages...`);

        // Get all messages
        const messageFetchStart = Date.now();
        const totalMessages: MessageCount[] = [];
        const totalUserMessageCount: UserMessageCount = {};
        const channels = await bcafBot.bcaf.channels.fetch();
        const channelList: Channel[] = [];
        for (const [ _, channel ] of channels) {
            if (!channel || channel.type != ChannelType.GuildText)
                continue;

            channelList.push({
                _id: channel.id,
                name: channel.name,
                createdTimestamp: channel.createdTimestamp,
                archived: channel.parent?.id == '890254720965423114'
            });

            console.log(`${new Date().toUTCString()} Looking through ${channel.name}`);

            const { messages, userMessageCount } = await fetchMessages(channel);
            for (const message of messages)
                totalMessages.push(message);
            for (const [ userId, count ] of Object.entries(userMessageCount)) {
                if (totalUserMessageCount[userId]) {
                    totalUserMessageCount[userId].messageCount += count.messageCount;
                    totalUserMessageCount[userId].messagesLast30Days += count.messagesLast30Days;
                    totalUserMessageCount[userId].characterCount += count.characterCount;
                } else
                    totalUserMessageCount[userId] = count;
            }
        }
        const messageFetchEnd = Date.now();

        console.log(`${new Date().toUTCString()} Finished fetching all messages in ${messageFetchEnd - messageFetchStart}ms`);
        console.log(`${new Date().toUTCString()} Updating user message stats...`);

        writeFileSync('./messages.json', JSON.stringify(totalMessages));

        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const timestamp = oneMonthAgo.getTime();
        const total = totalMessages.length;
        const totalLast30Days = totalMessages.filter(message => message.createdTimestamp >= timestamp).length;

        // Update accounts
        for (const [ userId, count ] of Object.entries(totalUserMessageCount)) {
            const { messageCount, messagesLast30Days, characterCount } = count;
            const level = 1 + Math.sqrt((3267 / 231400) * characterCount);
            const yapOMeter = characterCount / messageCount;
            const bcafShare = 0.25 * (messageCount / total) + 0.75 * (messagesLast30Days / totalLast30Days);

            const account = await BCAFAccount.fetch(userId, false);
            if (account) {
                console.log(`Updating user ${account.user.username}`);
                await account.update({ profile: { messageStats: { messageCount: messageCount, messagesLast30Days: messagesLast30Days, yapOMeter }, level } });

                if (messagesLast30Days >= 2000)
                    await account.grantAchievement({
                        name: 'alive chat wtf???',
                        description: 'Schicke 2000 Nachrichten innerhalb von 30 Tagen.'
                    });
            }
        }

        console.log(`${new Date().toUTCString()} Finished updating user message stats`);
        console.log(`${new Date().toUTCString()} Updating message index...`);

        // Update channel list
        const channelsCollection = bcafBot.bcafDb.collection('channels');
        await channelsCollection.bulkWrite(channelList.map(channel => ({
            updateOne: {
                filter: { _id: channel._id as any },
                update: { $set: {
                    name: channel.name,
                    createdTimestamp: channel.createdTimestamp,
                    archived: channel.archived
                } },
                upsert: true
            }
        })));

        // Update message index
        const messageCountDaily: { [timestamp: string]: { count: number; characters: number; } } = {};
        const messageCountWeeky: { [timestamp: string]: { count: number; characters: number; } } = {};
        for (const message of totalMessages) {
            const day = (message.createdTimestamp - (message.createdTimestamp % 86400000)).toString();
            const week = (message.createdTimestamp - (message.createdTimestamp % 604800000)).toString();
            if (!messageCountDaily[day])
                messageCountDaily[day] = {
                    count: 0,
                    characters: 0
                };
            messageCountDaily[day].count++;
            messageCountDaily[day].characters += message.content.length;
            if (!messageCountWeeky[week])
                messageCountWeeky[week] = {
                    count: 0,
                    characters: 0
                };
            messageCountWeeky[week].count++;
            messageCountWeeky[week].characters += message.content.length;
        }

        const bulkWriteStart = Date.now();
        const messagesCollection = bcafBot.bcafDb.collection('messages');
        await messagesCollection.bulkWrite(totalMessages.map(message => ({
            updateOne: {
                filter: { _id: message._id as any },
                update: { $set: {
                    content: message.content,
                    authorId: message.authorId,
                    channelId: message.channelId,
                    createdTimestamp: message.createdTimestamp
                } },
                upsert: true
            }
        })));
        const bulkWriteEnd = Date.now();
        console.log(`Bulk write took ${bulkWriteEnd - bulkWriteStart}ms`);

        const messageCountsCollection = bcafBot.bcafDb.collection('message-counts');
        await messageCountsCollection.replaceOne({ _id: 'daily' as any }, { _id: 'daily' as any, counts: messageCountDaily });
        await messageCountsCollection.replaceOne({ _id: 'weekly' as any }, { _id: 'weekly' as any, counts: messageCountWeeky });

        console.log(`${new Date().toUTCString()} Finished updating message index`);
        console.log(`${new Date().toUTCString()} Finished updating message data`);
    }
);